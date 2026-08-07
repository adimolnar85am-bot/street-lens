import { type UploadApiResponse } from "cloudinary";
import { configureCloudinary, cloudinary, isCloudinaryEnabled } from "./cloudinary-config";
import type { MerchAssignments, MerchPhoto } from "./merch-photos.types";

const MERCH_FOLDER = "street-lens/merch";
const ASSIGNMENTS_PUBLIC_ID = "street-lens/meta/merch-assignments";

export { isCloudinaryEnabled };

export function cloudinaryMerchPublicId(id: string): string {
  return `${MERCH_FOLDER}/${id}`;
}

export function merchIdFromCloudinarySrc(src: string): string | null {
  const match = src.match(/street-lens\/merch\/([^./?]+)/i);
  return match?.[1] ?? null;
}

export async function loadCloudinaryMerchIndex(): Promise<MerchPhoto[]> {
  if (!isCloudinaryEnabled()) return [];
  configureCloudinary();

  const entries: MerchPhoto[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: MERCH_FOLDER,
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const resource of result.resources) {
      const publicId = resource.public_id as string;
      const id = publicId.startsWith(`${MERCH_FOLDER}/`)
        ? publicId.slice(MERCH_FOLDER.length + 1)
        : publicId.split("/").pop() || "";
      if (!id) continue;
      entries.push({
        id,
        src: resource.secure_url,
        uploadedAt: resource.created_at,
      });
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  return entries;
}

export async function uploadMerchToCloudinary(
  id: string,
  buffer: Buffer
): Promise<MerchPhoto> {
  if (!isCloudinaryEnabled()) {
    throw new Error(
      "Cloudinary nu e configurat. Adaugă CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY și CLOUDINARY_API_SECRET în Vercel."
    );
  }

  configureCloudinary();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: cloudinaryMerchPublicId(id),
        overwrite: true,
        resource_type: "image",
        format: "jpg",
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Upload merch Cloudinary eșuat"));
          return;
        }
        resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return {
    id,
    src: result.secure_url,
    uploadedAt: result.created_at,
  };
}

export async function deleteMerchFromCloudinary(id: string): Promise<boolean> {
  if (!isCloudinaryEnabled()) return false;
  configureCloudinary();
  try {
    const result = await cloudinary.uploader.destroy(cloudinaryMerchPublicId(id), {
      resource_type: "image",
    });
    return result.result === "ok" || result.result === "not found";
  } catch {
    return false;
  }
}

export async function cloudinaryMerchExists(id: string): Promise<boolean> {
  if (!isCloudinaryEnabled()) return false;
  configureCloudinary();
  try {
    await cloudinary.api.resource(cloudinaryMerchPublicId(id), {
      resource_type: "image",
    });
    return true;
  } catch {
    return false;
  }
}

export async function readMerchAssignmentsFromCloudinary(): Promise<MerchAssignments | null> {
  if (!isCloudinaryEnabled()) return null;
  configureCloudinary();
  try {
    const url = cloudinary.url(ASSIGNMENTS_PUBLIC_ID, {
      resource_type: "raw",
      secure: true,
    });
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as MerchAssignments;
  } catch {
    return null;
  }
}

export async function writeMerchAssignmentsToCloudinary(
  assignments: MerchAssignments
): Promise<void> {
  if (!isCloudinaryEnabled()) return;
  configureCloudinary();
  await cloudinary.uploader.upload(JSON.stringify(assignments), {
    public_id: ASSIGNMENTS_PUBLIC_ID,
    resource_type: "raw",
    overwrite: true,
  });
}
