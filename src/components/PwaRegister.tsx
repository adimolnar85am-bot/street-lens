"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PwaRegister() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    /* Admin uses its own manifest/scope — skip main site service worker */
    if (pathname?.startsWith("/admin")) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* optional — install still works via manifest on iOS */
    });
  }, [pathname]);

  return null;
}
