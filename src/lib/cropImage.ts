export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getCroppedImg(
  imageSrc: string,
  cropArea: CropArea,
  fileName = 'cropped.jpg'
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));

      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Blob creation failed'));
          resolve(new File([blob], fileName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.92
      );
    };
    image.onerror = () => reject(new Error('Image load failed'));
    image.src = imageSrc;
  });
}