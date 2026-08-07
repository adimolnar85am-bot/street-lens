import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { PhotoOrientation } from "./photos";

const PHOTO_FOLDER = "street-lens/photos";
const EXCLUDED_PUBLIC_ID = "street-lens/meta/excluded";

export type CloudPhotoEntry = {
  id: string;
  src: string;
  width: number;
  height: number;
  orientation: PhotoOrientation;
  aspectRatio: string;
  uploadedAt?: string;
};

const LANDSCAPE_MIN_RATIO = 1.2;
const PORTRAIT_MAX_RATIO = 1 / 1.2;

function classify(width: number, height: number): PhotoOrientation {
  if (!width || !height) return "landscape";
  const ratio = width / height;
  if (ratio >= LANDSCAPE_MIN_RATIO) return "landscape";
  if (ratio <= PORTRAIT_MAX_RATIO) return "portrait";
  return "square";
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectRatioString(width: number, height: number): string {
  if (!width || !height) return "3 / 2";
  const g = gcd(width, height);
  const w = Math.round(width / g);
  const h = Math.round(height / g);
  if (w > 50 || h > 50) return `${(width / height).toFixed(3)}`;
  return `${w} / ${h}`;
}

export function isCloudinaryEnabled(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function cloudinaryPhotoPublicId(id: string): string {
  return `${PHOTO_FOLDER}/${id}`;
}

export function photoIdFromCloudinarySrc(src: string): string | null {
  const match = src.match(/street-lens\/photos\/([^./?]+)/i);
  return match?.[1] ?? null;
}

export async function loadCloudinaryPhotoIndex(): Promise<CloudPhotoEntry[]> {
  if (!isCloudinaryEnabled()) return [];
  configureCloudinary();

  const entries: CloudPhotoEntry[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: PHOTO_FOLDER,
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const resource of result.resources) {
      const publicId = resource.public_id as string;
      const id = publicId.startsWith(`${PHOTO_FOLDER}/`)
        ? publicId.slice(PHOTO_FOLDER.length + 1)
        : publicId.split("/").pop() || "";
      if (!id) continue;

      const width = resource.width ?? 0;
      const height = resource.height ?? 0;
      entries.push({
        id,
        src: resource.secure_url,
        width,
        height,
        orientation: classify(width, height),
        aspectRatio: aspectRatioString(width, height),
        uploadedAt: resource.created_at,
      });
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  return entries;
}

export async function uploadPhotoToCloudinary(
  id: string,
  buffer: Buffer,
  meta: Omit<CloudPhotoEntry, "id" | "src" | "uploadedAt">
): Promise<CloudPhotoEntry> {
  if (!isCloudinaryEnabled()) {
    throw new Error(
      "Cloudinary nu e configurat. Adaugă CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY și CLOUDINARY_API_SECRET în Vercel → Settings → Environment Variables."
    );
  }

  configureCloudinary();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: cloudinaryPhotoPublicId(id),
        overwrite: true,
        resource_type: "image",
        format: "jpg",
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Upload Cloudinary eșuat"));
          return;
        }
        resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  const width = meta.width || result.width || 0;
  const height = meta.height || result.height || 0;

  return {
    id,
    src: result.secure_url,
    width,
    height,
    orientation: meta.orientation || classify(width, height),
    aspectRatio: meta.aspectRatio || aspectRatioString(width, height),
    uploadedAt: result.created_at,
  };
}

export async function deletePhotoFromCloudinary(id: string): Promise<boolean> {
  if (!isCloudinaryEnabled()) return false;
  configureCloudinary();

  try {
    const result = await cloudinary.uploader.destroy(cloudinaryPhotoPublicId(id), {
      resource_type: "image",
    });
    return result.result === "ok" || result.result === "not found";
  } catch {
    return false;
  }
}

export async function cloudinaryPhotoExists(id: string): Promise<boolean> {
  if (!isCloudinaryEnabled()) return false;
  configureCloudinary();

  try {
    await cloudinary.api.resource(cloudinaryPhotoPublicId(id), {
      resource_type: "image",
    });
    return true;
  } catch {
    return false;
  }
}

export async function readExcludedFromCloudinary(): Promise<string[]> {
  if (!isCloudinaryEnabled()) return [];
  configureCloudinary();

  try {
    const url = cloudinary.url(EXCLUDED_PUBLIC_ID, {
      resource_type: "raw",
      secure: true,
    });
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as string[];
  } catch {
    return [];
  }
}

export async function writeExcludedToCloudinary(files: string[]): Promise<void> {
  if (!isCloudinaryEnabled()) return;
  configureCloudinary();

  await cloudinary.uploader.upload(JSON.stringify(files), {
    public_id: EXCLUDED_PUBLIC_ID,
    resource_type: "raw",
    overwrite: true,
  });
}
