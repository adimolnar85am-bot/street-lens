"use client";

import { useEffect } from "react";
import { useLocale } from "@/i18n/LocaleContext";

export function HtmlLang() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
