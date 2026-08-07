import "server-only";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { getSiteContent } from "./content-server";
import {
  deleteMerchFromBlob,
  isBlobStorageEnabled,
  loadMerchBlobIndex,
  merchBlobExists,
  readMerchAssignmentsFromBlob,
  uploadMerchToBlob,
  writeMerchAssignmentsToBlob,
} from "./merch-blob";
import {
  cloudinaryMerchExists,
  deleteMerchFromCloudinary,
  isCloudinaryEnabled,
  loadCloudinaryMerchIndex,
  merchIdFromCloudinarySrc,
  readMerchAssignmentsFromCloudinary,
  uploadMerchToCloudinary,
  writeMerchAssignmentsToCloudinary,
} from "./merch-cloudinary";
import {
  EMPTY_MERCH_ASSIGNMENTS,
  type MerchAssignments,
  type MerchPhoto,
} from "./merch-photos.types";

const MERCH_DIR = path.join(process.cwd(), "public", "merch");
const ASSIGNMENTS_PATH = path.join(process.cwd(), "src/lib/merch-assignments.json");

const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_UPLOAD_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_EDGE = Number(process.env.MAX_UPLOAD_EDGE) || 2400;
const MAX_SAVED_BYTES = 3.5 * 1024 * 1024;

const MERCH_PLACEHOLDER = "/icons/icon-512.png";

let merchEntries: MerchPhoto[] = [];
let assignmentsCache: MerchAssignments = { ...EMPTY_MERCH_ASSIGNMENTS };

function normalizeAssignments(data: Partial<MerchAssignments>): MerchAssignments {
  return { items: data.items ?? {} };
}

function readAssignmentsFile(): MerchAssignments {
  try {
    if (!fs.existsSync(ASSIGNMENTS_PATH)) return { ...EMPTY_MERCH_ASSIGNMENTS };
    const data = JSON.parse(fs.readFileSync(ASSIGNMENTS_PATH, "utf8")) as MerchAssignments;
    return normalizeAssignments(data);
  } catch {
    return { ...EMPTY_MERCH_ASSIGNMENTS };
  }
}

async function readAssignmentsFromRemoteOrDisk(): Promise<MerchAssignments> {
  if (isCloudinaryEnabled()) {
    const cloudData = await readMerchAssignmentsFromCloudinary();
    if (cloudData) return normalizeAssignments(cloudData);
  }
  if (isBlobStorageEnabled()) {
    const blobData = await readMerchAssignmentsFromBlob();
    if (blobData) return normalizeAssignments(blobData);
  }
  return readAssignmentsFile();
}

export const hydrateMerchStorage = cache(async () => {
  noStore();
  const cloudEntries = isCloudinaryEnabled() ? await loadCloudinaryMerchIndex() : [];
  const blobEntries = isBlobStorageEnabled() ? await loadMerchBlobIndex() : [];
  const localEntries = listDiskMerchPhotos().map((src) => ({
    id: merchIdFromSrc(src),
    src,
  }));
  const localIds = new Set(localEntries.map((e) => e.id));
  const byId = new Map<string, MerchPhoto>();
  for (const entry of blobEntries) {
    if (!localIds.has(entry.id)) byId.set(entry.id, entry);
  }
  for (const entry of cloudEntries) {
    if (!localIds.has(entry.id)) byId.set(entry.id, entry);
  }
  merchEntries = [...byId.values()];
  assignmentsCache = await readAssignmentsFromRemoteOrDisk();
});

export function getCachedMerchAssignments(): MerchAssignments {
  return assignmentsCache;
}

function merchIdFromSrc(src: string): string {
  const cloudId = merchIdFromCloudinarySrc(src);
  if (cloudId) return cloudId;
  if (src.startsWith("http")) {
    return src.split("/").pop()?.replace(/\.jpe?g$/i, "") ?? "";
  }
  return src.replace(/^\/merch\//, "").replace(/\.jpe?g$/i, "");
}

export function listDiskMerchPhotos(): string[] {
  noStore();
  if (!fs.existsSync(MERCH_DIR)) return [];
  return fs
    .readdirSync(MERCH_DIR)
    .filter((f) => /\.jpe?g$/i.test(f) && !f.startsWith("."))
    .sort()
    .map((f) => `/merch/${f}`);
}

export function listAllMerchPhotos(): MerchPhoto[] {
  noStore();
  const local = listDiskMerchPhotos();
  const localIds = new Set(local.map(merchIdFromSrc));
  const blobPhotos = merchEntries.filter((e) => !localIds.has(e.id));
  const localPhotos = local.map((src) => ({
    id: merchIdFromSrc(src),
    src,
  }));
  return [...blobPhotos, ...localPhotos].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
}

export function listAllMerchPhotosNewestFirst(): MerchPhoto[] {
  noStore();
  const local = listDiskMerchPhotos();
  const localIds = new Set(local.map(merchIdFromSrc));

  function localUploadedAt(src: string): number {
    try {
      return fs.statSync(path.join(MERCH_DIR, path.basename(src))).mtimeMs;
    } catch {
      return 0;
    }
  }

  const blobPhotos = merchEntries.filter((e) => !localIds.has(e.id));
  const localPhotos = local.map((src) => ({
    id: merchIdFromSrc(src),
    src,
    uploadedAt: new Date(localUploadedAt(src)).toISOString(),
  }));

  return [...blobPhotos, ...localPhotos].sort((a, b) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function getMerchPhotoSrcById(id: string): string | null {
  for (const photo of listAllMerchPhotos()) {
    if (photo.id === id) return photo.src;
  }
  return null;
}

export function getMerchImageForItem(itemId: string): string {
  const assignment = getCachedMerchAssignments().items[itemId];
  if (assignment?.src) return assignment.src;
  if (assignment?.photoId) {
    const src = getMerchPhotoSrcById(assignment.photoId);
    if (src) return src;
  }
  return MERCH_PLACEHOLDER;
}

export type MerchProductDef = {
  id: string;
  name: string;
  category: string;
  price: number;
  sizes?: string[];
};

export function getMerchProductCatalog(): MerchProductDef[] {
  const { shop } = getSiteContent();
  return shop.items.map((item) => ({
    id: item.id,
    name: item.ro.name,
    category: item.category,
    price: item.price,
    sizes: item.sizes,
  }));
}

async function processUploadImage(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const resizeOpts = {
    width: MAX_UPLOAD_EDGE,
    height: MAX_UPLOAD_EDGE,
    fit: "inside" as const,
    withoutEnlargement: true,
  };

  let quality = 88;
  let jpegBuffer = await sharp(buffer)
    .rotate()
    .resize(resizeOpts)
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toBuffer();

  while (jpegBuffer.length > MAX_SAVED_BYTES && quality > 52) {
    quality -= 8;
    jpegBuffer = await sharp(buffer)
      .rotate()
      .resize(resizeOpts)
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
  }

  return jpegBuffer;
}

async function merchExists(id: string): Promise<boolean> {
  const filePath = path.join(MERCH_DIR, `${id}.jpg`);
  if (fs.existsSync(filePath)) return true;
  if (isCloudinaryEnabled() && (await cloudinaryMerchExists(id))) return true;
  return merchBlobExists(id);
}

export async function uploadMerchPhotoFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<{ id: string; src: string }> {
  if (buffer.length > MAX_UPLOAD_INPUT_BYTES) {
    throw new Error("Fișier prea mare (max 25 MB înainte de procesare)");
  }

  const normalizedType = mimeType.toLowerCase() || "image/jpeg";
  if (!ALLOWED_UPLOAD_TYPES.has(normalizedType)) {
    throw new Error("Format neacceptat. Folosește JPG, PNG sau WebP.");
  }

  const jpegBuffer = await processUploadImage(buffer);

  let id = createHash("sha256")
    .update("merch:")
    .update(jpegBuffer)
    .digest("hex")
    .slice(0, 16);
  let attempt = 0;
  while ((await merchExists(id)) && attempt < 10) {
    attempt += 1;
    id = createHash("sha256")
      .update("merch:")
      .update(jpegBuffer)
      .update(String(attempt))
      .digest("hex")
      .slice(0, 16);
  }

  if (await merchExists(id)) {
    throw new Error("Nu s-a putut genera un nume unic pentru fișier");
  }

  const onVercel = Boolean(process.env.VERCEL);
  const useCloudinary = isCloudinaryEnabled();
  const useBlob = isBlobStorageEnabled();

  if (useCloudinary || (onVercel && !useBlob)) {
    if (!useCloudinary) {
      throw new Error(
        "Configurează Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET în Vercel."
      );
    }
    const entry = await uploadMerchToCloudinary(id, jpegBuffer);
    merchEntries = [entry, ...merchEntries.filter((e) => e.id !== id)];
    return { id, src: entry.src };
  }

  if (useBlob) {
    const entry = await uploadMerchToBlob(id, jpegBuffer);
    merchEntries = [entry, ...merchEntries.filter((e) => e.id !== id)];
    return { id, src: entry.src };
  }

  if (!fs.existsSync(MERCH_DIR)) {
    fs.mkdirSync(MERCH_DIR, { recursive: true });
  }

  const filePath = path.join(MERCH_DIR, `${id}.jpg`);
  fs.writeFileSync(filePath, jpegBuffer);
  return { id, src: `/merch/${id}.jpg` };
}

export async function deleteMerchPhotoPermanently(id: string): Promise<boolean> {
  const filePath = path.join(MERCH_DIR, `${id}.jpg`);
  let deleted = false;

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    deleted = true;
  }

  if (await deleteMerchFromCloudinary(id)) {
    deleted = true;
  }

  if (await deleteMerchFromBlob(id)) {
    deleted = true;
  }

  if (!deleted) return false;

  merchEntries = merchEntries.filter((e) => e.id !== id);

  const nextItems = { ...assignmentsCache.items };
  for (const [itemId, assignment] of Object.entries(nextItems)) {
    if (assignment.photoId === id) delete nextItems[itemId];
  }
  await writeMerchAssignments({ items: nextItems });

  return true;
}

export async function writeMerchAssignments(
  assignments: MerchAssignments
): Promise<MerchAssignments> {
  const normalized = normalizeAssignments(assignments);
  try {
    fs.writeFileSync(
      ASSIGNMENTS_PATH,
      `${JSON.stringify(normalized, null, 2)}\n`,
      "utf8"
    );
  } catch {
    /* read-only FS on Vercel */
  }
  if (isCloudinaryEnabled()) {
    await writeMerchAssignmentsToCloudinary(normalized);
  } else if (isBlobStorageEnabled()) {
    await writeMerchAssignmentsToBlob(normalized);
  }
  assignmentsCache = normalized;
  return normalized;
}

export async function assignMerchPhotoToItem(
  itemId: string,
  photoId: string | null
): Promise<MerchAssignments> {
  const items = { ...assignmentsCache.items };

  if (photoId) {
    const src = getMerchPhotoSrcById(photoId);
    if (!src) throw new Error("Imaginea merch nu a fost găsită");
    items[itemId] = { photoId, src };
  } else {
    delete items[itemId];
  }

  return writeMerchAssignments({ items });
}

export { MERCH_PLACEHOLDER };
