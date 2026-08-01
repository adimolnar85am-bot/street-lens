import type { Locale } from "@/i18n/config";

export type LocaleFields<T> = Record<Locale, T>;

export interface ContentSection {
  title: string;
  body: string;
}

export interface ContentArticle {
  id: string;
  categorySlug: "digital" | "analog" | "telefon";
  date: string;
  published: boolean;
  ro: { title: string; excerpt: string; body: string };
  en: { title: string; excerpt: string; body: string };
}

export interface ContentPhotowalk {
  id: string;
  date: string;
  participantCount: number;
  center: [number, number];
  ro: { title: string; theme: string; location: string; description: string };
  en: { title: string; theme: string; location: string; description: string };
}

export interface SiteContent {
  newsletter: LocaleFields<{
    title: string;
    body: string;
    emailPlaceholder: string;
    subject: string;
    contactEmail: string;
  }>;
  blog: LocaleFields<{
    pageTitle: string;
    pageBody: string;
  }>;
  hero: LocaleFields<{
    body: string;
    ctaWalk: string;
    ctaContest: string;
  }>;
  about: LocaleFields<{
    pageBody: string;
    missionBody: string;
    howBody: string;
  }>;
  contest: {
    active: {
      id: string;
      themeNumber: number;
      deadline: string;
      submissions: number;
      uploadSubject: string;
      ro: { title: string; theme: string; prize: string; pageBody: string };
      en: { title: string; theme: string; prize: string; pageBody: string };
    };
  };
  contestRules: LocaleFields<{
    pageTitle: string;
    pageBody: string;
    sections: ContentSection[];
  }>;
  articles: ContentArticle[];
  photowalks: ContentPhotowalk[];
}

export type ContentSectionKey = keyof SiteContent;
