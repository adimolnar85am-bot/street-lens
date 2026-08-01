"use client";

import { useEffect } from "react";

/**
 * Site-wide light protection against casual image theft.
 * Note: determined users can still capture via DevTools — this deters right-click/save.
 */
export function CopyrightProtection() {
  useEffect(() => {
    const blockContext = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // Inhibit right-click on media and anywhere inside protected regions
      if (
        t.closest(
          "img, picture, canvas, video, [data-protect-media], .protect-media, main"
        ) ||
        t.tagName === "IMG"
      ) {
        e.preventDefault();
      }
    };

    const blockDrag = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "IMG" || t.closest("[data-protect-media]"))) {
        e.preventDefault();
      }
    };

    const blockKeys = (e: KeyboardEvent) => {
      // Block common save / view-source shortcuts when focus is on media
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "u")) {
        const active = document.activeElement;
        if (active?.tagName === "IMG" || active?.closest("[data-protect-media]")) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("contextmenu", blockContext, true);
    document.addEventListener("dragstart", blockDrag, true);
    document.addEventListener("keydown", blockKeys, true);

    return () => {
      document.removeEventListener("contextmenu", blockContext, true);
      document.removeEventListener("dragstart", blockDrag, true);
      document.removeEventListener("keydown", blockKeys, true);
    };
  }, []);

  return null;
}
