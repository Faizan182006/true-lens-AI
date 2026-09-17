/**
 * Optimizes image files for transmission to the AI analysis endpoint.
 * Downscales images exceeding 1600px max dimension while preserving forensic fidelity,
 * preventing network timeouts and reverse proxy payload limit rejections.
 */
export async function optimizeImageForAnalysis(file: File): Promise<string> {
  return new Promise((resolve) => {
    // If not an image or SVG/GIF, fallback to FileReader
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const { width, height } = img;
        const maxDimension = 1600;

        // If already compact and reasonable dimensions, read directly
        if (width <= maxDimension && height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
          return;
        }

        let targetWidth = width;
        let targetHeight = height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            targetWidth = maxDimension;
            targetHeight = Math.round((height / width) * maxDimension);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round((width / height) * maxDimension);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        // Export high-quality JPEG (0.90) to retain fine forensic visual markers
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas optimization fallback to raw reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
