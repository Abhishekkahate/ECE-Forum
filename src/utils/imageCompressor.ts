/**
 * Ultra-Optimized Client-Side Image Compressor Utility
 * Compresses 5MB-15MB mobile photos/screenshots down to ~20KB-40KB WebP/JPEG
 * Saves 99%+ of network bandwidth and prevents Supabase database egress limits.
 */
export async function compressImage(
  fileOrBase64: File | string,
  maxWidth = 650,
  maxHeight = 850,
  quality = 0.55
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Constrain dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
        return;
      }

      // Fill canvas background white to prevent PNG alpha artifacts
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw compressed frame
      ctx.drawImage(img, 0, 0, width, height);

      // Try modern WebP first, fallback to JPEG
      try {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData && webpData.startsWith('data:image/webp')) {
          resolve(webpData);
          return;
        }
      } catch {}

      try {
        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      } catch (err) {
        resolve(canvas.toDataURL());
      }
    };

    img.onerror = (err) => {
      console.warn('Image compression fallback used', err);
      if (typeof fileOrBase64 === 'string') {
        resolve(fileOrBase64);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(fileOrBase64);
      }
    };

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
