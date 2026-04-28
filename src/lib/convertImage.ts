/**
 * Converts HEIC/HEIF images to JPEG before upload.
 * Strategy:
 *   1. Try browser-native decoding (works on macOS/iOS)
 *   2. Fall back to heic2any library
 *   3. If both fail, return the original file — upload it anyway
 */
export const ensureDisplayableImage = async (file: File): Promise<File> => {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name);

  if (!isHeic) return file;

  // ── Attempt 1: browser-native decoding via canvas ──
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );
      bitmap.close();
      if (blob) {
        return new File(
          [blob],
          file.name.replace(/\.(heic|heif)$/i, '.jpg'),
          { type: 'image/jpeg' }
        );
      }
    }
  } catch {
    // Browser can't decode HEIC natively — try heic2any
  }

  // ── Attempt 2: heic2any library ──
  try {
    const heic2any = (await import('heic2any')).default;
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
    return new File(
      [jpegBlob],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      { type: 'image/jpeg' }
    );
  } catch (error) {
    console.warn('HEIC conversion failed, uploading original:', error);
  }

  // ── Attempt 3: return original file as-is ──
  return file;
};