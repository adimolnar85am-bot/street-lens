import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import type { GalleryPhoto, PhotoOrientation } from "./photos";
import { PHOTO_ALT, PHOTO_COPYRIGHT } from "./photos";
import { shuffled } from "./photo-rotation";
import {
  blobPhotoExists,
  deletePhotoFromBlob,
  isBlobStorageEnabled,
  loadBlobPhotoIndex,
  readExcludedFromBlob,
  uploadPhotoToBlob,
  writeExcludedToBlob,
  type BlobPhotoEntry,
} from "./photo-blob";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const CATALOG_PATH = path.join(process.cwd(), "src/lib/photos.generated.json");
const EXCLUDED_PATH = path.join(process.cwd(), "src/lib/photos.excluded.json");

const LANDSCAPE_MIN_RATIO = 1.2;
const PORTRAIT_MAX_RATIO = 1 / 1.2;
const HERO_MAX = 18;

export type Catalog = {
  total: number;
  copyright: string;
  all: string[];
  ids: string[];
  hero: string[];
  landscape: string[];
  portrait: string[];
  square: string[];
};

type SizeMeta = {
  width: number;
  height: number;
  orientation: PhotoOrientation;
  aspectRatio: string;
};

function photoFileFromSrc(src: string): string {
  if (src.startsWith("http")) {
    return src.split("/").pop() || "";
  }
  return src.replace(/^\/photos\//, "");
}

export function photoIdFromSrc(src: string): string {
  return photoFileFromSrc(src).replace(/\.jpe?g$/i, "");
}

const sizeCache = new Map<string, SizeMeta>();
let blobEntries: BlobPhotoEntry[] = [];
let blobMetaBySrc = new Map<string, SizeMeta>();
let excludedCache: string[] | null = null;

function getImageSizeFromBuffer(buf: Buffer): { width: number; height: number } {
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      i += 2;
      continue;
    }
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
      };
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) break;
    i += 2 + len;
  }
  return { width: 0, height: 0 };
}

function getImageSize(filePath: string): { width: number; height: number } {
  return getImageSizeFromBuffer(fs.readFileSync(filePath));
}

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

function metaFromDimensions(width: number, height: number): SizeMeta {
  const orientation = classify(width, height);
  return {
    width,
    height,
    orientation,
    aspectRatio: aspectRatioString(width, height),
  };
}

/** Load blob index + excluded list (call once per request on server). */
export const hydratePhotoStorage = cache(async () => {
  noStore();
  if (isBlobStorageEnabled()) {
    blobEntries = await loadBlobPhotoIndex();
    blobMetaBySrc = new Map(
      blobEntries.map((e) => [
        e.src,
        {
          width: e.width,
          height: e.height,
          orientation: e.orientation,
          aspectRatio: e.aspectRatio,
        },
      ])
    );
    excludedCache = await readExcludedFromBlob();
    if (!excludedCache.length) {
      try {
        if (fs.existsSync(EXCLUDED_PATH)) {
          const local = JSON.parse(
            fs.readFileSync(EXCLUDED_PATH, "utf8")
          ) as string[];
          if (local.length) {
            excludedCache = local;
            await writeExcludedToBlob(local);
          }
        }
      } catch {
        /* non-fatal */
      }
    }
  } else {
    blobEntries = [];
    blobMetaBySrc = new Map();
    excludedCache = null;
  }
});

export function getPhotoMeta(src: string): SizeMeta {
  const cached = sizeCache.get(src);
  if (cached) return cached;

  if (src.startsWith("http")) {
    const blobMeta = blobMetaBySrc.get(src);
    if (blobMeta) {
      sizeCache.set(src, blobMeta);
      return blobMeta;
    }
    const fallback: SizeMeta = {
      width: 0,
      height: 0,
      orientation: "landscape",
      aspectRatio: "3 / 2",
    };
    sizeCache.set(src, fallback);
    return fallback;
  }

  const abs = path.join(PHOTOS_DIR, photoFileFromSrc(src));
  try {
    const { width, height } = getImageSize(abs);
    const meta = metaFromDimensions(width, height);
    sizeCache.set(src, meta);
    return meta;
  } catch {
    const meta: SizeMeta = {
      width: 0,
      height: 0,
      orientation: "landscape",
      aspectRatio: "3 / 2",
    };
    sizeCache.set(src, meta);
    return meta;
  }
}

function pickEvenly(srcs: string[], max: number): string[] {
  if (srcs.length <= max) return srcs;
  const step = Math.max(1, Math.floor(srcs.length / max));
  return srcs.filter((_, i) => i % step === 0).slice(0, max);
}

export function readExcluded(): string[] {
  noStore();
  if (excludedCache) return excludedCache;
  try {
    if (!fs.existsSync(EXCLUDED_PATH)) return [];
    return JSON.parse(fs.readFileSync(EXCLUDED_PATH, "utf8")) as string[];
  } catch {
    return [];
  }
}

async function writeExcluded(list: string[]) {
  excludedCache = list;
  if (isBlobStorageEnabled()) {
    await writeExcludedToBlob(list);
  }
  try {
    fs.writeFileSync(EXCLUDED_PATH, JSON.stringify(list, null, 2));
  } catch {
    /* read-only FS on Vercel */
  }
}

export function listDiskPhotos(): string[] {
  noStore();
  if (!fs.existsSync(PHOTOS_DIR)) return [];
  return fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => /\.jpe?g$/i.test(f) && !f.startsWith("."))
    .sort()
    .map((f) => `/photos/${f}`);
}

export function listAllPhotoSrcs(): string[] {
  const local = listDiskPhotos();
  const localIds = new Set(local.map(photoIdFromSrc));
  const blobSrcs = blobEntries
    .map((e) => e.src)
    .filter((src) => !localIds.has(photoIdFromSrc(src)));
  return [...local, ...blobSrcs].sort((a, b) =>
    photoIdFromSrc(a).localeCompare(photoIdFromSrc(b))
  );
}

function photoUploadedAtMs(src: string): number {
  if (src.startsWith("http")) {
    const entry = blobEntries.find((e) => e.src === src);
    if (entry?.uploadedAt) return new Date(entry.uploadedAt).getTime();
    return 0;
  }
  try {
    return fs.statSync(path.join(PHOTOS_DIR, photoFileFromSrc(src))).mtimeMs;
  } catch {
    return 0;
  }
}

/** Newest uploads first (admin list). */
export function listAllPhotoSrcsNewestFirst(): string[] {
  const local = listDiskPhotos();
  const localIds = new Set(local.map(photoIdFromSrc));
  const blobSrcs = blobEntries
    .filter((e) => !localIds.has(e.id))
    .map((e) => e.src);
  return [...blobSrcs, ...local].sort(
    (a, b) => photoUploadedAtMs(b) - photoUploadedAtMs(a)
  );
}

export function getVisiblePhotoSrcs(): string[] {
  noStore();
  const excluded = new Set(readExcluded());
  return listAllPhotoSrcs().filter(
    (src) => !excluded.has(photoFileFromSrc(src))
  );
}

export const getRotatedVisiblePhotoSrcs = cache((): string[] => {
  noStore();
  return shuffled(getVisiblePhotoSrcs());
});

export function getPhotosByOrientation(orientation: PhotoOrientation): string[] {
  return getRotatedVisiblePhotoSrcs().filter(
    (src) => getPhotoMeta(src).orientation === orientation
  );
}

export function photoForFrame(orientation: PhotoOrientation, index = 0): string {
  const primary = getPhotosByOrientation(orientation);
  if (primary.length) return primary[index % primary.length];

  const fallbackOrder: PhotoOrientation[] =
    orientation === "landscape"
      ? ["square", "portrait"]
      : orientation === "portrait"
        ? ["square", "landscape"]
        : ["portrait", "landscape"];

  for (const alt of fallbackOrder) {
    const list = getPhotosByOrientation(alt);
    if (list.length) return list[index % list.length];
  }

  const all = getRotatedVisiblePhotoSrcs();
  return all.length ? all[index % all.length] : "";
}

export function photoAt(index: number): string {
  return photoForFrame("landscape", index);
}

export function rebuildCatalog(): Catalog {
  return getCatalog();
}

export function getCatalog(): Catalog {
  noStore();
  const live = getRotatedVisiblePhotoSrcs();
  const landscape = live.filter(
    (src) => getPhotoMeta(src).orientation === "landscape"
  );
  const portrait = live.filter(
    (src) => getPhotoMeta(src).orientation === "portrait"
  );
  const square = live.filter(
    (src) => getPhotoMeta(src).orientation === "square"
  );
  const hero = pickEvenly(landscape, HERO_MAX);

  const catalog: Catalog = {
    total: live.length,
    copyright: PHOTO_COPYRIGHT,
    all: live,
    ids: live.map((src) => photoIdFromSrc(src)),
    hero,
    landscape,
    portrait,
    square,
  };

  try {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  } catch {
    /* non-fatal */
  }

  return catalog;
}

export function getHeroSlides() {
  return getCatalog().hero.map((src, i) => ({
    src,
    alt: PHOTO_ALT,
    label: `Cadru ${i + 1}`,
  }));
}

export function getPhotoCount() {
  return getCatalog().total;
}

export function getGalleryPhotos(): GalleryPhoto[] {
  const categories = ["digital", "analog", "telefon"] as const;
  return getRotatedVisiblePhotoSrcs().map((src, i) => {
    const meta = getPhotoMeta(src);
    return {
      id: `g-${i + 1}`,
      image: src,
      title: `Serie ${String(i + 1).padStart(3, "0")}`,
      photographer: "Street Lens",
      category: categories[i % categories.length],
      orientation: meta.orientation,
      aspectRatio: meta.aspectRatio,
    };
  });
}

export function getGalleryPreview(limit = 12): GalleryPhoto[] {
  const portraits = getGalleryPhotos().filter((p) => p.orientation === "portrait");
  const landscapes = getGalleryPhotos().filter((p) => p.orientation === "landscape");
  const squares = getGalleryPhotos().filter((p) => p.orientation === "square");
  const mixed: GalleryPhoto[] = [];
  let i = 0;
  while (mixed.length < limit && (portraits[i] || landscapes[i] || squares[i])) {
    if (portraits[i]) mixed.push(portraits[i]);
    if (mixed.length >= limit) break;
    if (landscapes[i]) mixed.push(landscapes[i]);
    if (mixed.length >= limit) break;
    if (squares[i]) mixed.push(squares[i]);
    i++;
  }
  return mixed.slice(0, limit);
}

export type AdminPhoto = {
  id: string;
  src: string;
  excluded: boolean;
  orientation: PhotoOrientation;
};

export function getAdminPhotos(): AdminPhoto[] {
  noStore();
  const excluded = new Set(readExcluded());
  return listAllPhotoSrcsNewestFirst().map((src) => {
    const file = photoFileFromSrc(src);
    const id = photoIdFromSrc(src);
    return {
      id,
      src,
      excluded: excluded.has(file),
      orientation: getPhotoMeta(src).orientation,
    };
  });
}

async function photoExists(id: string): Promise<boolean> {
  const filePath = path.join(PHOTOS_DIR, `${id}.jpg`);
  if (fs.existsSync(filePath)) return true;
  return blobPhotoExists(id);
}

export async function excludePhoto(id: string): Promise<boolean> {
  if (!(await photoExists(id))) return false;
  const file = `${id}.jpg`;
  const excluded = new Set(readExcluded());
  excluded.add(file);
  await writeExcluded([...excluded]);
  rebuildCatalog();
  return true;
}

export async function restorePhoto(id: string): Promise<boolean> {
  const file = `${id}.jpg`;
  const excluded = readExcluded().filter((f) => f !== file);
  await writeExcluded(excluded);
  rebuildCatalog();
  return true;
}

export async function deletePhotoPermanently(id: string): Promise<boolean> {
  const file = `${id}.jpg`;
  const filePath = path.join(PHOTOS_DIR, file);
  let deleted = false;

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    deleted = true;
  }

  if (await deletePhotoFromBlob(id)) {
    deleted = true;
  }

  if (!deleted) return false;

  await writeExcluded(readExcluded().filter((f) => f !== file));
  const removed = blobEntries.find((e) => e.id === id);
  blobEntries = blobEntries.filter((e) => e.id !== id);
  if (removed) blobMetaBySrc.delete(removed.src);
  rebuildCatalog();
  return true;
}

export function hashName(input: string) {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_UPLOAD_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_EDGE = Number(process.env.MAX_UPLOAD_EDGE) || 2400;
const MAX_SAVED_BYTES = 3.5 * 1024 * 1024;

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

  if (jpegBuffer.length > MAX_SAVED_BYTES) {
    const smallerEdge = Math.round(MAX_UPLOAD_EDGE * 0.75);
    jpegBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: smallerEdge,
        height: smallerEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 78, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
  }

  return jpegBuffer;
}

function metaFromBuffer(buffer: Buffer): SizeMeta {
  const { width, height } = getImageSizeFromBuffer(buffer);
  return metaFromDimensions(width, height);
}

export async function uploadPhotoFromBuffer(
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
  const meta = metaFromBuffer(jpegBuffer);

  let id = createHash("sha256").update(jpegBuffer).digest("hex").slice(0, 16);
  let attempt = 0;
  while ((await photoExists(id)) && attempt < 10) {
    attempt += 1;
    id = createHash("sha256")
      .update(jpegBuffer)
      .update(String(attempt))
      .digest("hex")
      .slice(0, 16);
  }

  if (await photoExists(id)) {
    throw new Error("Nu s-a putut genera un nume unic pentru fișier");
  }

  const onVercel = Boolean(process.env.VERCEL);
  const useBlob = isBlobStorageEnabled();

  if (useBlob || onVercel) {
    if (!useBlob) {
      throw new Error(
        "Activează Vercel Blob: Vercel → Storage → Blob → Connect Store → redeploy."
      );
    }
    const entry = await uploadPhotoToBlob(id, jpegBuffer, meta);
    blobEntries = [entry, ...blobEntries.filter((e) => e.id !== id)];
    blobMetaBySrc.set(entry.src, meta);
    sizeCache.set(entry.src, meta);
    rebuildCatalog();
    return { id, src: entry.src };
  }

  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  const filePath = path.join(PHOTOS_DIR, `${id}.jpg`);
  fs.writeFileSync(filePath, jpegBuffer);
  sizeCache.delete(filePath);
  rebuildCatalog();

  return { id, src: `/photos/${id}.jpg` };
}
