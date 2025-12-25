"use client";

import { getBrowserClient } from '@/lib/supabase/browser';

const supabase = getBrowserClient();

type UploadResult = { mediaId: string; storagePath: string };

function inferMediaType(mime: string): "photo" | "video" | "audio" | "file" {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "file";
}

function getExt(file: File): string {
  const byName = file.name.split(".").pop();
  if (byName && byName.length <= 5) return byName.toLowerCase();
  const mimeExt = file.type.split("/").pop();
  return (mimeExt || "bin").toLowerCase();
}

export async function uploadEventMedia(params: {
  eventId: string;
  file: File;
}): Promise<UploadResult> {
  const { eventId, file } = params;

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  const uploaderUid = user.id;

  // Storage key
  const ext = getExt(file);
  const fileId = crypto.randomUUID();
  const storagePath = `${uploaderUid}/${eventId}/${fileId}.${ext}`;

  // Upload to storage
  const { error: upErr } = await supabase.storage
    .from("timeline-media")
    .upload(storagePath, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type || undefined,
    });

  if (upErr) throw new Error(upErr.message);

  // Insert DB row
  const mediaType = inferMediaType(file.type || "");
  const { data: inserted, error: insErr } = await supabase
    .from("timeline_event_media")
    .insert({
      event_id: eventId,
      file_path: storagePath,
      file_type: mediaType,
    })
    .select("id")
    .single();

  if (insErr || !inserted)
    throw new Error(insErr?.message || "Failed to insert media row");

  return { mediaId: inserted.id, storagePath };
}

export async function getSignedMediaUrl(
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("timeline-media")
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl)
    throw new Error(error?.message || "Failed to create signed URL");

  return data.signedUrl;
}
