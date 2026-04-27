import heic2any from 'heic2any';

/**
 * Converts HEIC/HEIF images to JPEG before upload.
 * Browsers can't render HEIC natively — this ensures every
 * uploaded image is displayable everywhere (library, books,
 * timelines, capsules, albums, etc.).
 *
 * Usage:
 *   const file = await ensureDisplayableImage(rawFile);
 *   // then upload `file` to Supabase Storage as normal
 */
export const ensureDisplayableImage = async (file: File): Promise<File> => {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name);

  if (!isHeic) return file;

  try {
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
    console.error('HEIC conversion failed:', error);
    throw new Error(
      'This image format could not be processed. Please try uploading a JPG or PNG instead.'
    );
  }
};