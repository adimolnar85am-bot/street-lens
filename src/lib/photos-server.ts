import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import type { GalleryPhoto, PhotoOrientation } from "./photos";
import { PHOTO_ALT, PHOTO_COPYRIGHT } from "./photos";
import { shuffled } from "./photo-rotation";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const CATALOG_PATH = path.join(process.cwd(), "src/lib/photos.generated.json");
const EXCLUDED_PATH = path.join(process.cwd(), "src/lib/photos.excluded.json");

const LANDSCAPE_MIN_RATIO = 1.2;
const PORTRAIT_MAX_RATIO = 1 / 1.2; // width/height <= this → portrait
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

function filenameFromSrc(src: string) {
  return src.replace(/^\/photos\//, "");
}

const sizeCache = new Map<string, SizeMeta>();

/** Lightweight JPEG/PNG dimension reader (no full decode). */
function getImageSize(filePath: string): { width: number; height: number } {
  const buf = fs.readFileSync(filePath);
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
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) break;
    i += 2 + len;
  }
  return { width: 0, height: 0 };
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
  // Keep ratios readable
  if (w > 50 || h > 50) {
    return `${(width / height).toFixed(3)}`;
  }
  return `${w} / ${h}`;
}

export function getPhotoMeta(src: string): SizeMeta {
  const abs = path.join(PHOTOS_DIR, filenameFromSrc(src));
  const cached = sizeCache.get(abs);
  if (cached) return cached;

  try {
    const { width, height } = getImageSize(abs);
    const orientation = classify(width, height);
    const meta: SizeMeta = {
      width,
      height,
      orientation,
      aspectRatio: aspectRatioString(width, height),
    };
    sizeCache.set(abs, meta);
    return meta;
  } catch {
    const meta: SizeMeta = {
      width: 0,
      height: 0,
      orientation: "landscape",
      aspectRatio: "3 / 2",
    };
    sizeCache.set(abs, meta);
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
  try {
    if (!fs.existsSync(EXCLUDED_PATH)) return [];
    return JSON.parse(fs.readFileSync(EXCLUDED_PATH, "utf8")) as string[];
  } catch {
    return [];
  }
}

function writeExcluded(list: string[]) {
  fs.writeFileSync(EXCLUDED_PATH, JSON.stringify(list, null, 2));
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

export function getVisiblePhotoSrcs(): string[] {
  noStore();
  const excluded = new Set(readExcluded());
  return listDiskPhotos().filter((src) => !excluded.has(filenameFromSrc(src)));
}

/** Shuffled once per page load / navigation — consistent across all sections. */
export const getRotatedVisiblePhotoSrcs = cache((): string[] => {
  noStore();
  return shuffled(getVisiblePhotoSrcs());
});

export function getPhotosByOrientation(
  orientation: PhotoOrientation
): string[] {
  return getRotatedVisiblePhotoSrcs().filter(
    (src) => getPhotoMeta(src).orientation === orientation
  );
}

/**
 * Pick a photo that matches the frame orientation.
 * Falls back: square→portrait→landscape (or reverse) so UI never breaks.
 */
export function photoForFrame(
  orientation: PhotoOrientation,
  index = 0
): string {
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

/** @deprecated use photoForFrame — kept as landscape-biased alias */
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
    ids: live.map((src) => filenameFromSrc(src).replace(/\.jpe?g$/i, "")),
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
  const hero = getCatalog().hero;
  return hero.map((src, i) => ({
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
  // Balanced mix for masonry preview: portrait + landscape interleaved
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
  return listDiskPhotos().map((src) => {
    const file = filenameFromSrc(src);
    const id = file.replace(/\.jpe?g$/i, "");
    return {
      id,
      src,
      excluded: excluded.has(file),
      orientation: getPhotoMeta(src).orientation,
    };
  });
}

export function excludePhoto(id: string): boolean {
  const file = `${id}.jpg`;
  const filePath = path.join(PHOTOS_DIR, file);
  if (!fs.existsSync(filePath)) return false;
  const excluded = new Set(readExcluded());
  excluded.add(file);
  writeExcluded([...excluded]);
  rebuildCatalog();
  return true;
}

export function restorePhoto(id: string): boolean {
  const file = `${id}.jpg`;
  const excluded = readExcluded().filter((f) => f !== file);
  writeExcluded(excluded);
  rebuildCatalog();
  return true;
}

export function deletePhotoPermanently(id: string): boolean {
  const file = `${id}.jpg`;
  const filePath = path.join(PHOTOS_DIR, file);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  writeExcluded(readExcluded().filter((f) => f !== file));
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

  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  const jpegBuffer = await processUploadImage(buffer);

  let id = createHash("sha256").update(jpegBuffer).digest("hex").slice(0, 16);
  let filePath = path.join(PHOTOS_DIR, `${id}.jpg`);
  let attempt = 0;
  while (fs.existsSync(filePath) && attempt < 10) {
    attempt += 1;
    id = createHash("sha256")
      .update(jpegBuffer)
      .update(String(attempt))
      .digest("hex")
      .slice(0, 16);
    filePath = path.join(PHOTOS_DIR, `${id}.jpg`);
  }

  if (fs.existsSync(filePath)) {
    throw new Error("Nu s-a putut genera un nume unic pentru fișier");
  }

  try {
    fs.writeFileSync(filePath, jpegBuffer);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EPERM") {
      throw new Error(
        "Nu se pot salva fișiere pe server (limitare hosting). Încearcă local sau storage extern."
      );
    }
    throw err;
  }
  sizeCache.delete(filePath);
  rebuildCatalog();

  return { id, src: `/photos/${id}.jpg` };
}
