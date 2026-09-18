export const MAX_LONG_EDGE = 1920;
export const WEBP_QUALITY = 0.88;

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function replaceExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.[^/.]+$/, '') || 'image';
  return `${base}.${ext}`;
}

type DrawableImage = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, dx: number, dy: number, dw: number, dh: number) => void;
  close: () => void;
};

async function loadDrawableImage(file: File): Promise<DrawableImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, dx, dy, dw, dh) => ctx.drawImage(bitmap, dx, dy, dw, dh),
      close: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });

  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    draw: (ctx, dx, dy, dw, dh) => ctx.drawImage(image, dx, dy, dw, dh),
    close: () => URL.revokeObjectURL(objectUrl),
  };
}

function getScaledSize(
  width: number,
  height: number,
  maxLongEdge: number,
): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxLongEdge) {
    return { width, height };
  }
  const scale = maxLongEdge / longEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export interface CompressImageOptions {
  maxLongEdge?: number;
  quality?: number;
}

export interface CompressImageResult {
  file: File;
  compressed: boolean;
  usedFallback: boolean;
}

/**
 * Resize (long edge cap) and encode to WebP in the browser.
 * Falls back to JPEG if WebP encoding is unavailable.
 */
export async function compressImageToWebp(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressImageResult> {
  const maxLongEdge = options.maxLongEdge ?? MAX_LONG_EDGE;
  const quality = options.quality ?? WEBP_QUALITY;

  const source = await loadDrawableImage(file);
  try {
    const { width, height } = getScaledSize(source.width, source.height, maxLongEdge);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not supported');
    }

    source.draw(ctx, 0, 0, width, height);

    let usedFallback = false;
    let blob = await canvasToBlob(canvas, 'image/webp', quality);

    if (!blob) {
      usedFallback = true;
      blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }

    if (!blob) {
      throw new Error('Failed to encode compressed image');
    }

    // Prefer original when compression would make an already-small WebP larger
    const alreadyUnderCap =
      file.type === 'image/webp' &&
      Math.max(source.width, source.height) <= maxLongEdge;
    if (alreadyUnderCap && blob.size >= file.size) {
      return { file, compressed: false, usedFallback: false };
    }

    const mime = usedFallback ? 'image/jpeg' : 'image/webp';
    const ext = usedFallback ? 'jpg' : 'webp';
    const compressedFile = new File([blob], replaceExtension(file.name, ext), {
      type: mime,
      lastModified: Date.now(),
    });

    return { file: compressedFile, compressed: true, usedFallback };
  } finally {
    source.close();
  }
}

export async function compressImagesToWebp(
  files: File[],
  options: CompressImageOptions = {},
): Promise<{ files: File[]; fallbackCount: number }> {
  const output: File[] = [];
  let fallbackCount = 0;

  for (const file of files) {
    try {
      const result = await compressImageToWebp(file, options);
      output.push(result.file);
      if (result.usedFallback) fallbackCount += 1;
    } catch {
      // Keep original so one bad file does not block the batch
      output.push(file);
    }
  }

  return { files: output, fallbackCount };
}
