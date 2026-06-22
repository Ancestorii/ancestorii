// ============================================================================
// convert-voice-on-upload
// ----------------------------------------------------------------------------
// Fired (per file) by the `trg_convert_voice_note` storage trigger whenever a
// new audio object lands in one of the five voice buckets. Converts it to a
// single universal format (M4A / AAC, mono, 64kbps, 44.1kHz) via CloudConvert,
// writes the result back into the same bucket, preserves the original object's
// owner, and repoints the surface's pointer at the converted file.
//
// Rules honoured:
//  - Covers all 5 surfaces (album / capsule / timeline / memory / story).
//  - Skips files already M4A/AAC (app uploads are already correct).
//  - Idempotent: re-invocations do nothing once the file is converted.
//  - Per-file isolation: one file per invocation; a failure affects only it.
//  - Access split respected: same bucket (public stays public, private stays
//    signed) + owner copied BEFORE every repoint so private read policies pass.
//  - No deletes: the original object is left in place.
//
// Design note: we convert FIRST, then repoint. The client uploads to storage
// before writing the DB pointer row, so the trigger can fire before the pointer
// exists. CloudConvert's own latency absorbs that race; the repoint then retries
// briefly. CloudConvert settings match the app repo's one-off cleanup function.
// ============================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLOUDCONVERT_API_KEY = Deno.env.get("CLOUDCONVERT_API_KEY")!;
const SHARED_SECRET = Deno.env.get("VOICE_CONVERT_SECRET")!;

// A bucket can host more than one pointer table (memory-media does).
const SURFACE: Record<string, Array<{ table: string; col: string }>> = {
  "album-media":    [{ table: "album_media_voice_notes",          col: "file_path" }],
  "capsule-media":  [{ table: "capsule_voice_notes",              col: "file_path" }],
  "timeline-media": [{ table: "timeline_event_media_voice_notes", col: "file_path" }],
  "memory-media":   [
    { table: "family_memories",           col: "voice_note_path" },
    { table: "family_memory_voice_notes", col: "file_path" },
    { table: "family_memory_comments",    col: "voice_note_path" },
  ],
  "story-media":    [{ table: "stories",                          col: "voice_note_path" }],
};

const ALREADY_OK = /\.(m4a|aac)$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Supa = any;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Constant-time string compare (avoids leaking the secret via timing).
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

// Same folder + stem, extension swapped to .m4a (keeps memory-media's
// path-based read policy valid and keeps everything tidy alongside the original).
function toM4aKey(name: string): string {
  return /\.[^/.]+$/.test(name) ? name.replace(/\.[^/.]+$/, ".m4a") : `${name}.m4a`;
}

// Returns null if the object is absent, otherwise its size (or -1 when present
// but the size metadata isn't populated yet). Callers branch on existence, not 0.
async function objectInfo(sb: Supa, bucket: string, key: string): Promise<number | null> {
  const slash = key.lastIndexOf("/");
  const dir = slash >= 0 ? key.slice(0, slash) : "";
  const file = slash >= 0 ? key.slice(slash + 1) : key;
  const { data } = await sb.storage.from(bucket).list(dir, { search: file, limit: 100 });
  const hit = data?.find((o: { name: string; metadata?: { size?: number } }) => o.name === file);
  if (!hit) return null;
  return hit.metadata?.size ?? -1;
}

// Copy the original's owner onto the converted file, then repoint the surface
// pointer. Owner MUST be copied before repointing (album/capsule/timeline read
// policies gate on storage.objects.owner; a service-role write leaves it null).
// Retries the repoint to absorb the upload->pointer-insert race.
async function repointWithOwner(
  sb: Supa,
  surfaces: Array<{ table: string; col: string }>,
  bucket: string,
  src: string,
  dst: string,
): Promise<"already" | "repointed" | "no-row"> {
  // Already repointed on any of the bucket's surfaces?
  for (const s of surfaces) {
    const { data: done } = await sb.from(s.table).select("id").eq(s.col, dst).limit(1);
    if (done && done.length > 0) return "already";
  }

  const { error: ownErr } = await sb.rpc("copy_storage_object_owner", {
    p_bucket: bucket,
    p_src: src,
    p_dst: dst,
  });
  if (ownErr) throw new Error(`owner copy failed: ${ownErr.message}`);

  // The path lives in exactly one surface; try each. Retry to absorb the
  // upload->pointer-insert race.
  for (let i = 0; i < 5; i++) {
    for (const s of surfaces) {
      const { data, error } = await sb
        .from(s.table)
        .update({ [s.col]: dst })
        .eq(s.col, src)
        .select("id");
      if (error) throw new Error(`repoint failed (${s.table}): ${error.message}`);
      if (data && data.length > 0) return "repointed";
    }
    if (i < 4) await sleep(2000);
  }
  return "no-row"; // safety-net trigger will repoint when the pointer row lands
}

// CloudConvert signed-URL relay (no storage keys leave the project).
// Settings are an exact match for the app repo's cleanup function.
async function convertToM4a(srcSignedUrl: string): Promise<Uint8Array> {
  const create = await fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDCONVERT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-1": { operation: "import/url", url: srcSignedUrl },
        "convert-1": {
          operation: "convert",
          input: "import-1",
          output_format: "m4a",
          engine: "ffmpeg",
          audio_codec: "aac",
          audio_bitrate: 64,
          audio_channels: 1,
          audio_frequency: 44100,
        },
        "export-1": { operation: "export/url", input: "convert-1" },
      },
    }),
  });
  if (!create.ok) {
    throw new Error(`CloudConvert job create failed: ${create.status} ${await create.text()}`);
  }
  const jobId = (await create.json())?.data?.id;
  if (!jobId) throw new Error("CloudConvert returned no job id");

  const deadline = Date.now() + 110_000;
  while (Date.now() < deadline) {
    await sleep(2500);
    const res = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${CLOUDCONVERT_API_KEY}` },
    });
    if (!res.ok) continue;
    const job = (await res.json())?.data;
    if (!job) continue;
    if (job.status === "error") {
      const messages = (job.tasks ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((t: any) => t.message)
        .filter(Boolean);
      throw new Error(`CloudConvert job failed: ${JSON.stringify(messages)}`);
    }
    if (job.status === "finished") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exp = (job.tasks ?? []).find((t: any) => t.name === "export-1");
      const url = exp?.result?.files?.[0]?.url;
      if (!url) throw new Error("CloudConvert finished but returned no export URL");
      const dl = await fetch(url);
      if (!dl.ok) throw new Error(`Converted file download failed: ${dl.status}`);
      return new Uint8Array(await dl.arrayBuffer());
    }
  }
  throw new Error("CloudConvert job timed out");
}

serve(async (req) => {
  const header = req.headers.get("x-voice-convert-secret");
  if (!header || !SHARED_SECRET || !timingSafeEqual(header, SHARED_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }

  let bucket = "";
  let name = "";
  try {
    const payload = await req.json();
    bucket = payload?.bucket ?? "";
    name = payload?.name ?? "";

    const surfaces = SURFACE[bucket];
    if (!surfaces || !name) return json({ skipped: "unknown bucket or missing name", bucket, name });
    if (ALREADY_OK.test(name)) return json({ skipped: "already m4a/aac", name });

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const dst = toM4aKey(name);

    // --- Idempotent fast path: the converted file already exists. -----------
    if ((await objectInfo(sb, bucket, dst)) !== null) {
      const r = await repointWithOwner(sb, surfaces, bucket, name, dst);
      return json({ skipped: "already converted", bucket, to: dst, repoint: r });
    }

    // --- Convert via a short-lived signed URL; verify non-empty. ------------
    const { data: signed, error: signErr } = await sb.storage
      .from(bucket)
      .createSignedUrl(name, 600);
    if (signErr || !signed?.signedUrl) throw new Error(`could not sign source: ${signErr?.message}`);

    const bytes = await convertToM4a(signed.signedUrl);
    if (!bytes || bytes.byteLength === 0) throw new Error("converted output is empty");

    // Re-check right before writing to shrink the duplicate-conversion window.
    if ((await objectInfo(sb, bucket, dst)) !== null) {
      const r = await repointWithOwner(sb, surfaces, bucket, name, dst);
      return json({ skipped: "converted concurrently", bucket, to: dst, repoint: r });
    }

    // --- Write converted file; confirm it exists. ---------------------------
    const { error: upErr } = await sb.storage.from(bucket).upload(dst, bytes, {
      contentType: "audio/mp4",
      upsert: true,
    });
    if (upErr) throw new Error(`upload of converted file failed: ${upErr.message}`);
    if ((await objectInfo(sb, bucket, dst)) === null) {
      throw new Error("converted file missing after upload");
    }

    // --- Preserve owner, then repoint (with retry for the race). ------------
    const repoint = await repointWithOwner(sb, surfaces, bucket, name, dst);

    return json({ converted: true, bucket, from: name, to: dst, bytes: bytes.byteLength, repoint });
  } catch (err) {
    console.error("convert-voice-on-upload error", {
      bucket,
      name,
      error: String((err as Error)?.message ?? err),
    });
    return json({ error: String((err as Error)?.message ?? err), bucket, name }, 500);
  }
});
