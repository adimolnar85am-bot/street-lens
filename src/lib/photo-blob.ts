import { del, list, put } from "@vercel/blob";

const PHOTO_PREFIX = "photos/";
const INDEX_PATH = "meta/photos-index.json";
const EXCLUDED_PATH = "meta/excluded.json";
const ASSIGNMENTS_PATH = "meta/photo-assignments.json";

const putOpts = {
  access: "public" as const,
  addRandomSuffix: false,
  allowOverwrite: true,
};

export type BlobPhotoEntry = {
  id: string;
  src: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "square";
  aspectRatio: string;
  uploadedAt?: string;
};

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function photoIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/photos\/([^.]+)\.jpe?g$/i);
  return match?.[1] ?? null;
}

async function readBlobPhotoIndexRaw(): Promise<BlobPhotoEntry[]> {
  if (!isBlobStorageEnabled()) return [];
  try {
    const { blobs } = await list({ prefix: INDEX_PATH, limit: 1 });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { photos?: BlobPhotoEntry[] };
    return data.photos ?? [];
  } catch {
    return [];
  }
}

/** Recover blob photos missing from index (e.g. after failed index write). */
export async function recoverMissingBlobPhotos(): Promise<BlobPhotoEntry[]> {
  if (!isBlobStorageEnabled()) return [];

  const index = await readBlobPhotoIndexRaw();
  const byId = new Map(index.map((entry) => [entry.id, entry]));
  const missing: BlobPhotoEntry[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: PHOTO_PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const id = photoIdFromPathname(blob.pathname);
      if (!id || byId.has(id)) continue;
      const entry: BlobPhotoEntry = {
        id,
        src: blob.url,
        width: 0,
        height: 0,
        orientation: "landscape",
        aspectRatio: "3 / 2",
        uploadedAt: blob.uploadedAt.toISOString(),
      };
      missing.push(entry);
      byId.set(id, entry);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  if (!missing.length) return index;

  const merged = [...missing, ...index];
  await saveBlobPhotoIndex(merged);
  return merged;
}

export async function loadBlobPhotoIndex(): Promise<BlobPhotoEntry[]> {
  const index = await readBlobPhotoIndexRaw();
  if (index.length > 0) return index;

  const { blobs } = await list({ prefix: PHOTO_PREFIX, limit: 1 });
  if (!blobs.length) return [];
  return recoverMissingBlobPhotos();
}

async function saveBlobPhotoIndex(photos: BlobPhotoEntry[]): Promise<void> {
  if (!isBlobStorageEnabled()) return;
  await put(
    INDEX_PATH,
    JSON.stringify({ photos, updatedAt: new Date().toISOString() }),
    {
      ...putOpts,
      contentType: "application/json",
    }
  );
}

export async function uploadPhotoToBlob(
  id: string,
  buffer: Buffer,
  meta: Omit<BlobPhotoEntry, "id" | "src" | "uploadedAt">
): Promise<BlobPhotoEntry> {
  if (!isBlobStorageEnabled()) {
    throw new Error(
      "Vercel Blob nu e configurat. În Vercel: Storage → Blob → Connect, apoi redeploy."
    );
  }

  const pathname = `${PHOTO_PREFIX}${id}.jpg`;
  const blob = await put(pathname, buffer, {
    ...putOpts,
    contentType: "image/jpeg",
  });

  const entry: BlobPhotoEntry = {
    id,
    src: blob.url,
    uploadedAt: new Date().toISOString(),
    ...meta,
  };

  const index = await readBlobPhotoIndexRaw();
  const next = [entry, ...index.filter((p) => p.id !== id)];
  await saveBlobPhotoIndex(next);

  return entry;
}

export async function deletePhotoFromBlob(id: string): Promise<boolean> {
  if (!isBlobStorageEnabled()) return false;

  const index = await readBlobPhotoIndexRaw();
  const entry = index.find((p) => p.id === id);
  if (!entry) return false;

  try {
    await del(entry.src);
  } catch {
    /* blob may already be gone */
  }

  await saveBlobPhotoIndex(index.filter((p) => p.id !== id));
  return true;
}

export async function readExcludedFromBlob(): Promise<string[]> {
  if (!isBlobStorageEnabled()) return [];
  try {
    const { blobs } = await list({ prefix: EXCLUDED_PATH, limit: 1 });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as string[];
  } catch {
    return [];
  }
}

export async function writeExcludedToBlob(files: string[]): Promise<void> {
  if (!isBlobStorageEnabled()) return;
  await put(EXCLUDED_PATH, JSON.stringify(files, null, 2), {
    ...putOpts,
    contentType: "application/json",
  });
}

export type BlobPhotoAssignments = {
  slots: Record<string, string>;
  slotSrcs?: Record<string, string>;
};

export async function readAssignmentsFromBlob(): Promise<BlobPhotoAssignments | null> {
  if (!isBlobStorageEnabled()) return null;
  try {
    const { blobs } = await list({ prefix: ASSIGNMENTS_PATH, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as BlobPhotoAssignments;
    return {
      slots: data.slots ?? {},
      slotSrcs: data.slotSrcs ?? {},
    };
  } catch {
    return null;
  }
}

export async function writeAssignmentsToBlob(
  assignments: BlobPhotoAssignments
): Promise<void> {
  if (!isBlobStorageEnabled()) return;
  await put(
    ASSIGNMENTS_PATH,
    JSON.stringify(
      {
        slots: assignments.slots,
        slotSrcs: assignments.slotSrcs ?? {},
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    {
      ...putOpts,
      contentType: "application/json",
    }
  );
}

export async function blobPhotoExists(id: string): Promise<boolean> {
  const index = await readBlobPhotoIndexRaw();
  return index.some((p) => p.id === id);
}
