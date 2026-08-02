/** Fisher–Yates shuffle with a numeric seed (same seed → same order). */
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

/** Random order — new seed on every call. */
export function shuffled<T>(items: T[]): T[] {
  return seededShuffle(items, Math.floor(Math.random() * 0xffffffff));
}
