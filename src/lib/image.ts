/**
 * Shrinks a photo in the browser before upload, so phones don't send 8 MB pictures.
 * PDFs and anything that is not an image are returned as they are.
 */
export async function shrinkImage(file: File, opts: { maxSide: number; square?: boolean; quality?: number }): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    if (opts.square) {
      // Centre crop to a square (passport photo).
      const s = opts.maxSide;
      const k = Math.max(s / img.width, s / img.height);
      canvas.width = s;
      canvas.height = s;
      ctx.drawImage(img, (s - img.width * k) / 2, (s - img.height * k) / 2, img.width * k, img.height * k);
    } else {
      const k = Math.min(1, opts.maxSide / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', opts.quality ?? 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
