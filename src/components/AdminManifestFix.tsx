"use client";

import { useLayoutEffect } from "react";

/** Ensures admin pages always reference the admin PWA manifest. */
export function AdminManifestFix() {
  useLayoutEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.prepend(link);
    }
    link.href = "/admin.webmanifest";
  }, []);

  return null;
}
