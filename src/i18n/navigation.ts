import type { NavItem } from "@/lib/data";
import type { Locale } from "./config";
import { isLocale } from "./config";
import type { Dictionary } from "./dictionaries";

export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function switchLocalePath(pathname: string, newLocale: Locale): string {
  const segments = pathname.split("/");
  if (segments[1] && isLocale(segments[1])) {
    segments[1] = newLocale;
    return segments.join("/") || `/${newLocale}`;
  }
  return localePath(newLocale, pathname);
}

export function getNavigation(locale: Locale, dict: Dictionary): NavItem[] {
  return [
    {
      label: dict.nav.community,
      children: [
        {
          label: dict.nav.about,
          href: localePath(locale, "/despre"),
          description: dict.nav.aboutDesc,
        },
        {
          label: dict.nav.photowalks,
          href: localePath(locale, "/photowalks"),
          description: dict.nav.photowalksDesc,
        },
        {
          label: dict.nav.map,
          href: localePath(locale, "/harta"),
          description: dict.nav.mapDesc,
        },
        {
          label: dict.nav.gallery,
          href: localePath(locale, "/galerie"),
          description: dict.nav.galleryDesc,
        },
      ],
    },
    {
      label: dict.nav.photography,
      children: [
        {
          label: dict.nav.digital,
          href: localePath(locale, "/fotografie/digital"),
          description: dict.nav.digitalDesc,
        },
        {
          label: dict.nav.analog,
          href: localePath(locale, "/fotografie/analog"),
          description: dict.nav.analogDesc,
        },
        {
          label: dict.nav.phone,
          href: localePath(locale, "/fotografie/telefon"),
          description: dict.nav.phoneDesc,
        },
        {
          label: dict.nav.guides,
          href: localePath(locale, "/ghiduri"),
          description: dict.nav.guidesDesc,
        },
      ],
    },
    {
      label: dict.nav.contests,
      children: [
        {
          label: dict.nav.contestMonth,
          href: localePath(locale, "/concursuri"),
          description: dict.nav.contestMonthDesc,
        },
        {
          label: dict.nav.contestArchive,
          href: localePath(locale, "/concursuri/arhiva"),
          description: dict.nav.contestArchiveDesc,
        },
        {
          label: dict.nav.contestRules,
          href: localePath(locale, "/concursuri/regulament"),
          description: dict.nav.contestRulesDesc,
        },
      ],
    },
    {
      label: dict.nav.shop,
      children: [
        {
          label: dict.nav.merch,
          href: localePath(locale, "/magazin"),
          description: dict.nav.merchDesc,
        },
        {
          label: dict.nav.print,
          href: localePath(locale, "/magazin/print"),
          description: dict.nav.printDesc,
        },
        {
          label: dict.nav.cart,
          href: localePath(locale, "/magazin/cos"),
          description: dict.nav.cartDesc,
        },
      ],
    },
    {
      label: dict.nav.resources,
      children: [
        {
          label: dict.nav.blog,
          href: localePath(locale, "/blog"),
          description: dict.nav.blogDesc,
        },
        {
          label: dict.nav.calendar,
          href: localePath(locale, "/calendar"),
          description: dict.nav.calendarDesc,
        },
        {
          label: dict.nav.membership,
          href: localePath(locale, "/membership"),
          description: dict.nav.membershipDesc,
        },
      ],
    },
  ];
}
