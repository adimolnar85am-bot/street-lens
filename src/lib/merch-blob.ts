import { del, list, put } from "@vercel/blob";
import type { MerchPhoto } from "./merch-photos.types";

const MERCH_PREFIX = "merch/";
const INDEX_PATH = "meta/merch-index.json";
const ASSIGNMENTS_PATH = "meta/merch-assignments.json";

const putOpts = {
  access: "public" as const,
  addRandomSuffix: false,
  allowOverwrite: true,
};

export { isBlobStorageEnabled } from "./photo-blob";

function merchIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/merch\/([^.]+)\.jpe?g$/i);
  return match?.[1] ?? null;
}

async function readMerchIndexRaw(): Promise<MerchPhoto[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return [];
  try {
    const { blobs } = await list({ prefix: INDEX_PATH, limit: 1 });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { photos?: MerchPhoto[] };
    return data.photos ?? [];
  } catch {
    return [];
  }
}

async function saveMerchIndex(photos: MerchPhoto[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return;
  await put(
    INDEX_PATH,
    JSON.stringify({ photos, updatedAt: new Date().toISOString() }),
    {
      ...putOpts,
      contentType: "application/json",
    }
  );
}

export async function loadMerchBlobIndex(): Promise<MerchPhoto[]> {
  const index = await readMerchIndexRaw();
  if (index.length > 0) return index;

  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return [];

  const { blobs } = await list({ prefix: MERCH_PREFIX, limit: 1 });
  if (!blobs.length) return [];

  const recovered: MerchPhoto[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: MERCH_PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const id = merchIdFromPathname(blob.pathname);
      if (!id) continue;
      recovered.push({
        id,
        src: blob.url,
        uploadedAt: blob.uploadedAt.toISOString(),
      });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  if (recovered.length) await saveMerchIndex(recovered);
  return recovered;
}

export async function uploadMerchToBlob(
  id: string,
  buffer: Buffer
): Promise<MerchPhoto> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    throw new Error(
      "Vercel Blob nu e configurat. În Vercel: Storage → Blob → Connect, apoi redeploy."
    );
  }

  const pathname = `${MERCH_PREFIX}${id}.jpg`;
  const blob = await put(pathname, buffer, {
    ...putOpts,
    contentType: "image/jpeg",
  });

  const entry: MerchPhoto = {
    id,
    src: blob.url,
    uploadedAt: new Date().toISOString(),
  };

  const index = await readMerchIndexRaw();
  const next = [entry, ...index.filter((p) => p.id !== id)];
  await saveMerchIndex(next);
  return entry;
}

export async function deleteMerchFromBlob(id: string): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return false;

  const index = await readMerchIndexRaw();
  const entry = index.find((p) => p.id === id);
  if (!entry) return false;

  try {
    await del(entry.src);
  } catch {
    /* blob may already be gone */
  }

  await saveMerchIndex(index.filter((p) => p.id !== id));
  return true;
}

export async function merchBlobExists(id: string): Promise<boolean> {
  const index = await readMerchIndexRaw();
  return index.some((p) => p.id === id);
}

export async function readMerchAssignmentsFromBlob(): Promise<MerchAssignmentsBlob | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return null;
  try {
    const { blobs } = await list({ prefix: ASSIGNMENTS_PATH, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as MerchAssignmentsBlob;
    return { items: data.items ?? {} };
  } catch {
    return null;
  }
}

export type MerchAssignmentsBlob = {
  items: Record<string, { photoId: string; src: string }>;
};

export async function writeMerchAssignmentsToBlob(
  assignments: MerchAssignmentsBlob
): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return;
  await put(
    ASSIGNMENTS_PATH,
    JSON.stringify(
      { items: assignments.items, updatedAt: new Date().toISOString() },
      null,
      2
    ),
    {
      ...putOpts,
      contentType: "application/json",
    }
  );
}
