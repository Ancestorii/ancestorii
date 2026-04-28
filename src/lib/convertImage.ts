/**
 * Converts HEIC/HEIF images to JPEG before upload.
 * Strategy:
 *   1. If not HEIC, return as-is
 *   2. Try browser-native decoding (works on macOS Safari)
 *   3. Try heic2any client-side library
 *   4. Send to server-side Sharp conversion (bulletproof)
 *   5. If everything fails, return original
 */
export const ensureDisplayableImage = async (file: File): Promise<File> => {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name);

  if (!isHeic) return file;

  const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');

  // ── Attempt 1: browser-native decoding ──
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
      if (blob && blob.size > 0) {
        return new File([blob], newName, { type: 'image/jpeg' });
      }
    }
  } catch {
    // Browser can't decode HEIC natively
  }

  // ── Attempt 2: heic2any client-side ──
  try {
    const heic2any = (await import('heic2any')).default;
    const buffer = await file.arrayBuffer();
    const freshBlob = new Blob([buffer], { type: 'image/heic' });

    const converted = await heic2any({
      blob: freshBlob,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
    if (jpegBlob && jpegBlob.size > 0) {
      return new File([jpegBlob], newName, { type: 'image/jpeg' });
    }
  } catch {
    // heic2any failed
  }

  // ── Attempt 3: server-side Sharp conversion (bulletproof) ──
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/convert-image', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const jpegBlob = await res.blob();
      if (jpegBlob && jpegBlob.size > 0) {
        return new File([jpegBlob], newName, { type: 'image/jpeg' });
      }
    }
  } catch {
    // Server conversion failed
  }

  // ── Last resort: return original ──
  console.warn('All HEIC conversion methods failed, uploading original');
  return file;
};