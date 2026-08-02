/** Resize/compress images in browser before upload (helps Vercel body limits). */

const MAX_EDGE = 2400;
const JPEG_QUALITY = 0.82;
const COMPRESS_IF_LARGER_THAN = 1.5 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nu s-a putut citi imaginea"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Compresie eșuată"));
      },
      "image/jpeg",
      quality
    );
  });
}

/** Returns a JPEG file, resized if needed. */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Fișierul nu este o imagine");
  }

  const isSmallJpeg =
    /jpe?g$/i.test(file.name) && file.size <= COMPRESS_IF_LARGER_THAN;

  if (isSmallJpeg) {
    return file;
  }

  const img = await loadImage(file);
  const { width, height } = img;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponibil");

  ctx.drawImage(img, 0, 0, w, h);

  let quality = JPEG_QUALITY;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > 3.5 * 1024 * 1024 && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export async function prepareImagesForUpload(files: File[]): Promise<File[]> {
  const out: File[] = [];
  for (const file of files) {
    out.push(await prepareImageForUpload(file));
  }
  return out;
}
