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

export interface MembershipTier {
  name: string;
  price: string;
  period: string;
  cta: string;
  features: string[];
  highlighted: boolean;
  mailto: boolean;
}

export interface ContentMerchItem {
  id: string;
  price: number;
  category: "tees" | "print" | "apparel" | "accessories";
  ro: { name: string };
  en: { name: string };
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
  terms: LocaleFields<{
    pageTitle: string;
    updated: string;
    intro: string;
    sections: ContentSection[];
  }>;
  privacy: LocaleFields<{
    pageTitle: string;
    intro: string;
    sections: ContentSection[];
  }>;
  membership: LocaleFields<{
    pageTitle: string;
    pageBody: string;
    sectionTitle: string;
    sectionBody: string;
    learnMore: string;
    joinSubject: string;
    homepageCards: { price: string; features: string }[];
    tiers: {
      free: MembershipTier;
      community: MembershipTier;
      patron: MembershipTier;
    };
  }>;
  shop: {
    orderSubject: string;
    ro: {
      pageTitle: string;
      pageBody: string;
      printPageTitle: string;
      printPageBody: string;
      printSectionTitle: string;
      printSectionBody: string;
      customPrint: string;
      addToCart: string;
      sectionEyebrow: string;
      sectionTitle: string;
      sectionSeeAll: string;
      sectionPrintTitle: string;
      sectionPrintBody: string;
      sectionSeePrints: string;
      catTees: string;
      catPrint: string;
      catApparel: string;
      catAccessories: string;
    };
    en: {
      pageTitle: string;
      pageBody: string;
      printPageTitle: string;
      printPageBody: string;
      printSectionTitle: string;
      printSectionBody: string;
      customPrint: string;
      addToCart: string;
      sectionEyebrow: string;
      sectionTitle: string;
      sectionSeeAll: string;
      sectionPrintTitle: string;
      sectionPrintBody: string;
      sectionSeePrints: string;
      catTees: string;
      catPrint: string;
      catApparel: string;
      catAccessories: string;
    };
    items: ContentMerchItem[];
  };
}

export type ContentSectionKey = keyof SiteContent;
