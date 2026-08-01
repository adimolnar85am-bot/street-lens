/** Client-safe photo constants & types (no filesystem). */

export const PHOTO_COPYRIGHT =
  "© Street Lens. Toate drepturile rezervate.";

/** Generic alt — never expose filenames */
export const PHOTO_ALT = "Fotografie din comunitatea Street Lens";

const categories = ["digital", "analog", "telefon"] as const;

export type GalleryCategory = (typeof categories)[number];

export type PhotoOrientation = "landscape" | "portrait" | "square";

export interface GalleryPhoto {
  id: string;
  image: string;
  title: string;
  photographer: string;
  category: GalleryCategory;
  orientation: PhotoOrientation;
  /** CSS aspect-ratio value matching the real photo */
  aspectRatio: string;
}

export interface HeroSlide {
  src: string;
  alt: string;
  label: string;
}
