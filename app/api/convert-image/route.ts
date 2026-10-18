import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// The server path for HEIC photos a browser could not convert itself (src/lib/convertImage.ts
// tries the browser and heic2any first). The decoder (heic-convert, which carries libheif's
// wasm) is imported inside the handler, so it loads on the first conversion only, never with
// the route. The host caps the request body before this runs (Vercel: 4.5 MB), so a larger
// photo is refused there and the client falls back on its own.
const MAX_BYTES = 25 * 1024 * 1024;
const TIMEOUT_MS = 25_000;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  let file: File | null = null;
  try {
    const formData = await request.formData();
    const field = formData.get('file');
    file = field instanceof File ? field : null;
  } catch {
    return fail(400, 'Expected a form upload with a "file" field.');
  }

  if (!file) return fail(400, 'No file provided');
  if (file.size === 0) return fail(400, 'The file is empty.');
  if (file.size > MAX_BYTES) {
    return fail(413, `Photos up to ${MAX_BYTES / 1024 / 1024} MB can be converted here.`);
  }

  // Windows gives HEIC files no type at all, so the name counts too.
  const looksHeic = /^image\/hei[cf]$/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  if (!looksHeic) return fail(415, 'Only HEIC and HEIF photos are converted here.');

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const convert = (await import('heic-convert')).default;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS);
    });

    const outputBuffer = await Promise.race([
      convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 0.9,
      }),
      timeout,
    ]);

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'timeout') {
      return fail(504, 'Converting this photo took too long. Export it as JPEG and try again.');
    }
    console.error('Image conversion failed:', error);
    return fail(422, 'This photo could not be converted: ' + (message || 'unknown error'));
  } finally {
    if (timer) clearTimeout(timer);
  }
}
