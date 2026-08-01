import "server-only";
import fs from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import type { Locale } from "@/i18n/config";
import type { ContentSectionKey, SiteContent } from "./content.types";

const CONTENT_PATH = path.join(process.cwd(), "src/lib/content.json");

function readContentFile(): SiteContent {
  const raw = fs.readFileSync(CONTENT_PATH, "utf8");
  return JSON.parse(raw) as SiteContent;
}

export function getSiteContent(): SiteContent {
  noStore();
  return readContentFile();
}

export function writeSiteContent(content: SiteContent): void {
  fs.writeFileSync(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export function updateContentSection<K extends ContentSectionKey>(
  section: K,
  data: SiteContent[K]
): SiteContent {
  const content = readContentFile();
  content[section] = data;
  writeSiteContent(content);
  return content;
}

export function getNewsletterContent(locale: Locale) {
  return getSiteContent().newsletter[locale];
}

export function getBlogPageContent(locale: Locale) {
  return getSiteContent().blog[locale];
}

export function getHeroContent(locale: Locale) {
  return getSiteContent().hero[locale];
}

export function getAboutContent(locale: Locale) {
  return getSiteContent().about[locale];
}

export function getContestRulesContent(locale: Locale) {
  return getSiteContent().contestRules[locale];
}

export function getPublishedArticles(locale: Locale) {
  return getSiteContent().articles.filter((a) => a.published);
}

export function getArticleById(id: string) {
  return getSiteContent().articles.find((a) => a.id === id);
}
