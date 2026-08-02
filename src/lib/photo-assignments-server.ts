import "server-only";
import fs from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { getSiteContent } from "./content-server";
import {
  EMPTY_PHOTO_ASSIGNMENTS,
  type PhotoAssignments,
  type PhotoSlotDef,
} from "./photo-assignments.types";
import {
  isBlobStorageEnabled,
  readAssignmentsFromBlob,
  writeAssignmentsToBlob,
} from "./photo-blob";

const ASSIGNMENTS_PATH = path.join(
  process.cwd(),
  "src/lib/photo-assignments.json"
);

const PHOTOWALK_PINS: Record<string, { id: string }[]> = {
  "pw-1": [{ id: "pin-1" }, { id: "pin-2" }, { id: "pin-3" }],
  "pw-2": [{ id: "pin-4" }, { id: "pin-5" }, { id: "pin-6" }],
};

const HERO_SLOTS = 18;
const GALLERY_FEATURED_SLOTS = 12;

function readAssignmentsFile(): PhotoAssignments {
  try {
    if (!fs.existsSync(ASSIGNMENTS_PATH)) return { ...EMPTY_PHOTO_ASSIGNMENTS };
    const data = JSON.parse(fs.readFileSync(ASSIGNMENTS_PATH, "utf8")) as PhotoAssignments;
    return { slots: data.slots ?? {} };
  } catch {
    return { ...EMPTY_PHOTO_ASSIGNMENTS };
  }
}

async function readAssignmentsFromBlobOrDisk(): Promise<PhotoAssignments> {
  if (isBlobStorageEnabled()) {
    const blobSlots = await readAssignmentsFromBlob();
    if (blobSlots) return { slots: blobSlots };
  }
  return readAssignmentsFile();
}

export async function getPhotoAssignments(): Promise<PhotoAssignments> {
  noStore();
  return readAssignmentsFromBlobOrDisk();
}

export function getPhotoAssignmentsSync(): PhotoAssignments {
  noStore();
  return readAssignmentsFile();
}

export async function writePhotoAssignments(
  assignments: PhotoAssignments
): Promise<PhotoAssignments> {
  const normalized = { slots: { ...assignments.slots } };
  try {
    fs.writeFileSync(
      ASSIGNMENTS_PATH,
      `${JSON.stringify(normalized, null, 2)}\n`,
      "utf8"
    );
  } catch {
    /* read-only FS on Vercel */
  }
  if (isBlobStorageEnabled()) {
    await writeAssignmentsToBlob(normalized.slots);
  }
  return normalized;
}

export function buildPhotoSlotCatalog(): PhotoSlotDef[] {
  const content = getSiteContent();
  const slots: PhotoSlotDef[] = [];

  slots.push({
    key: "contest",
    label: "Imagine principală",
    section: "Concurs",
  });

  for (let i = 0; i < HERO_SLOTS; i++) {
    slots.push({
      key: `hero.${i}`,
      label: `Slide ${i + 1}`,
      section: "Hero (homepage)",
    });
  }

  for (let i = 0; i < GALLERY_FEATURED_SLOTS; i++) {
    slots.push({
      key: `galleryFeatured.${i}`,
      label: `Poză ${i + 1}`,
      section: "Galerie homepage",
    });
  }

  for (const walk of content.photowalks) {
    slots.push({
      key: `photowalks.${walk.id}.cover`,
      label: `${walk.ro.title} — copertă`,
      section: "Photowalk-uri",
    });
    for (const pin of PHOTOWALK_PINS[walk.id] ?? []) {
      slots.push({
        key: `photowalks.${walk.id}.pins.${pin.id}`,
        label: `${walk.ro.title} — cadru ${pin.id.replace("pin-", "")}`,
        section: "Photowalk-uri",
      });
    }
  }

  for (const item of content.shop.items) {
    slots.push({
      key: `shop.${item.id}`,
      label: item.ro.name,
      section: "Magazin",
    });
  }

  for (const article of content.articles.filter((a) => a.published)) {
    slots.push({
      key: `articles.${article.id}`,
      label: article.ro.title,
      section: "Blog & ghiduri",
    });
  }

  const categoryLabels: Record<string, string> = {
    digital: "Digital",
    analog: "Analog",
    telefon: "Telefon",
  };
  for (const id of ["digital", "analog", "telefon"] as const) {
    slots.push({
      key: `categories.${id}.hero`,
      label: `${categoryLabels[id]} — hero`,
      section: "Formate foto",
    });
    slots.push({
      key: `categories.${id}.banner`,
      label: `${categoryLabels[id]} — banner`,
      section: "Formate foto",
    });
  }

  return slots;
}

export function getAssignedPhotoId(
  assignments: PhotoAssignments,
  key: string
): string | undefined {
  const id = assignments.slots[key];
  return id || undefined;
}

export { HERO_SLOTS, GALLERY_FEATURED_SLOTS };
