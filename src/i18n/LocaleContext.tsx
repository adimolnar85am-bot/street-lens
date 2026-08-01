"use client";

import { createContext, useContext, useEffect } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

export interface LocaleContent {
  newsletter: {
    title: string;
    body: string;
    emailPlaceholder: string;
    subject: string;
    contactEmail: string;
  };
  hero: {
    body: string;
    ctaWalk: string;
    ctaContest: string;
  };
}

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  content: LocaleContent;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  content,
  children,
}: LocaleContextValue & { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, dict, content }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
