// Camera originals (up to 4284×5712) make next/image slow to serve, so the public story
// editor shrinks photos in the browser before they are uploaded.
const MAX_EDGE = 2560;
const JPEG_QUALITY = 0.88;
// Formats a canvas can redraw without losing anything that matters. GIFs (which may move),
// SVGs and anything else are uploaded exactly as chosen.
const RESIZABLE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/bmp'];

/**
 * Returns the photo with its long edge at most 2560px. PNGs stay PNG (they may be
 * transparent); other formats become JPEG at quality 0.88. A photo already within the limit
 * comes back untouched. EXIF orientation is applied while decoding, so phone photos stay the
 * right way up. If the browser can't decode or redraw it, the original file is returned.
 */
export async function downscaleImage(file: File): Promise<File> {
  if (!RESIZABLE.includes(file.type) || typeof createImageBitmap !== 'function') return file;

  let bitmap: ImageBitmap | null = null;
  try {
    // A browser that doesn't know 'from-image' throws here, so the photo is never turned.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = MAX_EDGE / Math.max(bitmap.width, bitmap.height);
    if (scale >= 1) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    const keepPng = file.type === 'image/png';
    if (!keepPng) {
      // JPEG has no transparency: see-through pixels become white rather than black.
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const type = keepPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, keepPng ? undefined : JPEG_QUALITY)
    );
    // Let go of the pixels straight away (phones cap total canvas memory).
    canvas.width = 0;
    canvas.height = 0;
    if (!blob || blob.size === 0) return file;

    // The upload takes its extension from the name, so a WebP that became JPEG is renamed.
    const name =
      keepPng || file.type === 'image/jpeg' ? file.name : `${file.name.replace(/\.[^.]+$/, '')}.jpg`;
    return new File([blob], name, { type, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
