import "server-only";
import { photoForFrame, getGalleryPreview } from "./photos-server";
import type { Contest, MerchItem, PhotoCategory, Photowalk } from "./data";
import type { Dictionary } from "@/i18n/dictionaries";

export function getPhotowalks(dict: Dictionary): Photowalk[] {
  return [
    {
      id: "pw-1",
      title: dict.photowalks.pw1Title,
      theme: dict.photowalks.pw1Theme,
      date: "2026-07-26",
      location: dict.photowalks.pw1Location,
      coverImage: photoForFrame("landscape", 0),
      description: dict.photowalks.pw1Desc,
      participantCount: 18,
      center: [44.4268, 26.1025],
      pins: [
        {
          id: "pin-1",
          lat: 44.4289,
          lng: 26.1011,
          title: dict.photowalks.trailFrame,
          photographer: dict.gallery.photographer,
          image: photoForFrame("landscape", 1),
          theme: dict.photowalks.pw1Theme,
          date: "2026-07-26",
        },
        {
          id: "pin-2",
          lat: 44.4255,
          lng: 26.1042,
          title: dict.photowalks.trailFrame,
          photographer: dict.gallery.photographer,
          image: photoForFrame("landscape", 2),
          theme: dict.photowalks.pw1Theme,
          date: "2026-07-26",
        },
        {
          id: "pin-3",
          lat: 44.4272,
          lng: 26.0998,
          title: dict.photowalks.trailFrame,
          photographer: dict.gallery.photographer,
          image: photoForFrame("landscape", 3),
          theme: dict.photowalks.pw1Theme,
          date: "2026-07-26",
        },
      ],
    },
    {
      id: "pw-2",
      title: dict.photowalks.pw2Title,
      theme: dict.photowalks.pw2Theme,
      date: "2026-07-19",
      location: dict.photowalks.pw2Location,
      coverImage: photoForFrame("landscape", 4),
      description: dict.photowalks.pw2Desc,
      participantCount: 22,
      center: [44.4271, 26.1026],
      pins: [
        {
          id: "pin-4",
          lat: 44.4265,
          lng: 26.103,
          title: dict.photowalks.trailFrame,
          photographer: dict.gallery.photographer,
          image: photoForFrame("landscape", 5),
          theme: dict.photowalks.pw2Theme,
          date: "2026-07-19",
        },
        {
          id: "pin-5",
          lat: 44.428,
          lng: 26.1015,
          title: dict.photowalks.trailFrame,
          photographer: dict.gallery.photographer,
          image: photoForFrame("landscape", 6),
          theme: dict.photowalks.pw2Theme,
          date: "2026-07-19",
        },
        {
          id: "pin-6",
          lat: 44.4275,
          lng: 26.1005,
          title: dict.photowalks.trailFrame,
          photographer: dict.gallery.photographer,
          image: photoForFrame("landscape", 7),
          theme: dict.photowalks.pw2Theme,
          date: "2026-07-19",
        },
      ],
    },
  ];
}

export function getActiveContest(dict: Dictionary): Contest {
  return {
    id: "c-1",
    title: dict.contest.title,
    theme: dict.contest.theme,
    themeNumber: 1,
    deadline: "2026-08-31",
    prize: dict.contest.prizeText,
    image: photoForFrame("portrait", 0),
    submissions: 47,
  };
}

export function getPrintItems(dict: Dictionary): MerchItem[] {
  return getMerchItems(dict).filter((item) => item.category === dict.shop.catPrint);
}

export function getBlogArticles(dict: Dictionary) {
  const categories = getPhotoCategories(dict);
  return categories.flatMap((cat) =>
    cat.articles.map((article, index) => ({
      id: `${cat.slug}-${index + 1}`,
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      date: article.date,
      category: cat.title,
      categorySlug: cat.slug,
    }))
  );
}

export function getMerchItems(dict: Dictionary): MerchItem[] {
  return [
    {
      id: "m1",
      name: dict.shop.tee,
      price: 89,
      image: photoForFrame("square", 0),
      category: dict.shop.catTees,
    },
    {
      id: "m2",
      name: dict.shop.print1,
      price: 145,
      image: photoForFrame("square", 1),
      category: dict.shop.catPrint,
    },
    {
      id: "m3",
      name: dict.shop.print2,
      price: 120,
      image: photoForFrame("square", 2),
      category: dict.shop.catPrint,
    },
    {
      id: "m4",
      name: dict.shop.poster,
      price: 95,
      image: photoForFrame("square", 3),
      category: dict.shop.catPrint,
    },
  ];
}

export function getPhotoCategories(dict: Dictionary): PhotoCategory[] {
  return [
    {
      id: "digital",
      title: dict.formats.digital.title,
      slug: "digital",
      tagline: dict.formats.digital.tagline,
      description: dict.formats.digital.description,
      heroImage: photoForFrame("portrait", 1),
      bannerImage: photoForFrame("landscape", 14),
      articles: [
        {
          title: dict.articles.digital1Title,
          excerpt: dict.articles.digital1Excerpt,
          image: photoForFrame("landscape", 8),
          date: "2026-07-15",
        },
        {
          title: dict.articles.digital2Title,
          excerpt: dict.articles.digital2Excerpt,
          image: photoForFrame("landscape", 9),
          date: "2026-07-08",
        },
      ],
    },
    {
      id: "analog",
      title: dict.formats.analog.title,
      slug: "analog",
      tagline: dict.formats.analog.tagline,
      description: dict.formats.analog.description,
      heroImage: photoForFrame("portrait", 2),
      bannerImage: photoForFrame("landscape", 15),
      articles: [
        {
          title: dict.articles.analog1Title,
          excerpt: dict.articles.analog1Excerpt,
          image: photoForFrame("landscape", 10),
          date: "2026-07-10",
        },
        {
          title: dict.articles.analog2Title,
          excerpt: dict.articles.analog2Excerpt,
          image: photoForFrame("landscape", 11),
          date: "2026-06-28",
        },
      ],
    },
    {
      id: "telefon",
      title: dict.formats.phone.title,
      slug: "telefon",
      tagline: dict.formats.phone.tagline,
      description: dict.formats.phone.description,
      heroImage: photoForFrame("portrait", 3),
      bannerImage: photoForFrame("landscape", 16),
      articles: [
        {
          title: dict.articles.phone1Title,
          excerpt: dict.articles.phone1Excerpt,
          image: photoForFrame("landscape", 12),
          date: "2026-07-20",
        },
        {
          title: dict.articles.phone2Title,
          excerpt: dict.articles.phone2Excerpt,
          image: photoForFrame("landscape", 13),
          date: "2026-07-05",
        },
      ],
    },
  ];
}

export { getGalleryPreview };
