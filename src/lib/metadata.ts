import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { siteName, siteUrl } from "./site";

type PageMeta = {
  title: string;
  description: string;
  path?: string;
  locale: Locale;
  ogTitle?: string;
  ogDescription?: string;
  manifest?: string;
};

export function buildPageMetadata({
  title,
  description,
  path = "",
  locale,
  ogTitle,
  ogDescription,
  manifest,
}: PageMeta): Metadata {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  const url = `${siteUrl}/${locale}${normalizedPath}`;
  const ogImageUrl = `${siteUrl}/${locale}/opengraph-image`;

  return {
    title,
    description,
    ...(manifest ? { manifest } : {}),
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
      languages: {
        ro: `${siteUrl}/ro${normalizedPath}`,
        en: `${siteUrl}/en${normalizedPath}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "ro" ? "ro_RO" : "en_US",
      url,
      siteName,
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      images: [ogImageUrl],
    },
  };
}
