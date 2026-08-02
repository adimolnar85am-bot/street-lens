import "server-only";
import { resolvePhotoSrc } from "./photos-server";
import {
  getPublishedArticles,
  getSiteContent,
} from "./content-server";
import type { Contest, MerchItem, PhotoCategory, Photowalk } from "./data";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const PHOTOWALK_PINS: Record<
  string,
  { id: string; lat: number; lng: number; photoIndex: number }[]
> = {
  "pw-1": [
    { id: "pin-1", lat: 38.7125, lng: -9.1312, photoIndex: 1 },
    { id: "pin-2", lat: 38.7108, lng: -9.1285, photoIndex: 2 },
    { id: "pin-3", lat: 38.714, lng: -9.133, photoIndex: 3 },
  ],
  "pw-2": [
    { id: "pin-4", lat: 52.518, lng: 13.3785, photoIndex: 5 },
    { id: "pin-5", lat: 52.5155, lng: 13.376, photoIndex: 6 },
    { id: "pin-6", lat: 52.5172, lng: 13.381, photoIndex: 7 },
  ],
};

export function getPhotowalks(dict: Dictionary, locale: Locale = "ro"): Photowalk[] {
  const content = getSiteContent();
  return content.photowalks.map((walk, index) => {
    const copy = walk[locale];
    const pinDefs = PHOTOWALK_PINS[walk.id] ?? [];
    return {
      id: walk.id,
      title: copy.title,
      theme: copy.theme,
      date: walk.date,
      location: copy.location,
      coverImage: resolvePhotoSrc(`photowalks.${walk.id}.cover`, {
        orientation: "landscape",
        index: index * 4,
      }),
      description: copy.description,
      participantCount: walk.participantCount,
      center: walk.center,
      pins: pinDefs.map((pin) => ({
        id: pin.id,
        lat: pin.lat,
        lng: pin.lng,
        title: dict.photowalks.trailFrame,
        photographer: dict.gallery.photographer,
        image: resolvePhotoSrc(`photowalks.${walk.id}.pins.${pin.id}`, {
          orientation: "landscape",
          index: pin.photoIndex,
        }),
        theme: copy.theme,
        date: walk.date,
      })),
    };
  });
}

export function getActiveContest(dict: Dictionary, locale: Locale = "ro"): Contest {
  const { active } = getSiteContent().contest;
  const copy = active[locale];
  return {
    id: active.id,
    title: copy.title,
    theme: copy.theme,
    themeNumber: active.themeNumber,
    deadline: active.deadline,
    prize: copy.prize,
    image: resolvePhotoSrc("contest", { orientation: "portrait", index: 0 }),
    submissions: active.submissions,
  };
}

export function getPrintItems(dict: Dictionary, locale: Locale = "ro"): MerchItem[] {
  return getMerchItems(dict, locale).filter((item) => {
    const { shop } = getSiteContent();
    const copy = shop[locale];
    return item.category === copy.catPrint;
  });
}

export function getBlogArticles(dict: Dictionary, locale: Locale = "ro") {
  const articles = getPublishedArticles(locale);
  const categoryTitles: Record<string, string> = {
    digital: dict.formats.digital.title,
    analog: dict.formats.analog.title,
    telefon: dict.formats.phone.title,
  };
  const photoOffsets: Record<string, number> = {
    digital: 8,
    analog: 10,
    telefon: 12,
  };

  return articles.map((article, index) => ({
    id: article.id,
    title: article[locale].title,
    excerpt: article[locale].excerpt,
    body: article[locale].body,
    image: resolvePhotoSrc(`articles.${article.id}`, {
      orientation: "landscape",
      index: (photoOffsets[article.categorySlug] ?? 8) + (index % 2),
    }),
    date: article.date,
    category: categoryTitles[article.categorySlug] ?? article.categorySlug,
    categorySlug: article.categorySlug,
  }));
}

export function getMerchItems(dict: Dictionary, locale: Locale = "ro"): MerchItem[] {
  const { shop } = getSiteContent();
  const copy = shop[locale];
  const categoryLabels = { tees: copy.catTees, print: copy.catPrint };

  return shop.items.map((item, index) => ({
    id: item.id,
    name: item[locale].name,
    price: item.price,
    image: resolvePhotoSrc(`shop.${item.id}`, {
      orientation: "square",
      index,
    }),
    category: categoryLabels[item.category],
  }));
}

export function getPhotoCategories(dict: Dictionary, locale: Locale = "ro"): PhotoCategory[] {
  const articles = getPublishedArticles(locale);
  const byCategory = (slug: string) =>
    articles
      .filter((a) => a.categorySlug === slug)
      .map((a, i) => ({
        title: a[locale].title,
        excerpt: a[locale].excerpt,
        image: resolvePhotoSrc(`articles.${a.id}`, {
          orientation: "landscape",
          index: slug === "digital" ? 8 + i : slug === "analog" ? 10 + i : 12 + i,
        }),
        date: a.date,
      }));

  return [
    {
      id: "digital",
      title: dict.formats.digital.title,
      slug: "digital",
      tagline: dict.formats.digital.tagline,
      description: dict.formats.digital.description,
      heroImage: resolvePhotoSrc("categories.digital.hero", {
        orientation: "portrait",
        index: 1,
      }),
      bannerImage: resolvePhotoSrc("categories.digital.banner", {
        orientation: "landscape",
        index: 14,
      }),
      articles: byCategory("digital"),
    },
    {
      id: "analog",
      title: dict.formats.analog.title,
      slug: "analog",
      tagline: dict.formats.analog.tagline,
      description: dict.formats.analog.description,
      heroImage: resolvePhotoSrc("categories.analog.hero", {
        orientation: "portrait",
        index: 2,
      }),
      bannerImage: resolvePhotoSrc("categories.analog.banner", {
        orientation: "landscape",
        index: 15,
      }),
      articles: byCategory("analog"),
    },
    {
      id: "telefon",
      title: dict.formats.phone.title,
      slug: "telefon",
      tagline: dict.formats.phone.tagline,
      description: dict.formats.phone.description,
      heroImage: resolvePhotoSrc("categories.telefon.hero", {
        orientation: "portrait",
        index: 3,
      }),
      bannerImage: resolvePhotoSrc("categories.telefon.banner", {
        orientation: "landscape",
        index: 16,
      }),
      articles: byCategory("telefon"),
    },
  ];
}

export { getGalleryPreview } from "./photos-server";
