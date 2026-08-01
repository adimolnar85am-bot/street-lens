import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

const paths = [
  "",
  "/despre",
  "/photowalks",
  "/harta",
  "/galerie",
  "/concursuri",
  "/concursuri/regulament",
  "/concursuri/arhiva",
  "/ghiduri",
  "/blog",
  "/calendar",
  "/magazin",
  "/magazin/print",
  "/membership",
  "/fotografie/digital",
  "/fotografie/analog",
  "/fotografie/telefon",
  "/termeni",
  "/confidentialitate",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of paths) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  return entries;
}
