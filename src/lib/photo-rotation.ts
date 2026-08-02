import { createHash } from "crypto";

/** How often the site-wide photo selection rotates (default: every 6 hours). */
const ROTATION_HOURS = Math.max(
  1,
  Number(process.env.PHOTO_ROTATION_HOURS) || 6
);

export const PHOTO_ROTATION_MS = ROTATION_HOURS * 60 * 60 * 1000;

/** Time slot index — same value for all photo picks within this window. */
export function getPhotoRotationSlot(now = Date.now()): number {
  return Math.floor(now / PHOTO_ROTATION_MS);
}

export function getPhotoRotationHours(): number {
  return ROTATION_HOURS;
}

/** Deterministic shuffle — same slot + list always yields the same order. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  if (items.length <= 1) return [...items];

  const arr = [...items];
  let state = seed >>> 0;

  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function rotationSeedForSlot(slot: number): number {
  return parseInt(
    createHash("sha256").update(`streetlens-photos:${slot}`).digest("hex").slice(0, 8),
    16
  );
}
