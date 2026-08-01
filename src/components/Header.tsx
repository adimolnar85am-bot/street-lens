"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Camera, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import { getNavigation, localePath, switchLocalePath } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

function LanguageSwitcher() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const otherLocale: Locale = locale === "ro" ? "en" : "ro";

  return (
    <Link
      href={switchLocalePath(pathname ?? "/", otherLocale)}
      className="px-3 py-1.5 text-xs font-bold tracking-wider border border-ink-600 hover:border-signal text-cream/70 hover:text-signal rounded-sm transition-colors"
      aria-label={dict.lang.switchTo}
    >
      {dict.lang[otherLocale]}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { locale, dict } = useLocale();
  const navigation = getNavigation(locale, dict);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-md border-b border-ink-800">
      <div className="h-0.5 bg-signal/40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href={localePath(locale, "/")} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full bg-leica flex items-center justify-center shadow-[0_0_0_2px_rgba(226,6,18,0.25)] group-hover:shadow-[0_0_0_3px_rgba(226,6,18,0.35)] transition-shadow">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-xl lg:text-2xl text-cream">
                {dict.brand.name}
              </span>
              <span className="hidden sm:block text-xs text-ink-400 tracking-widest uppercase">
                {dict.brand.tagline}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 text-sm font-semibold text-cream/80 hover:text-signal transition-colors rounded-md",
                    openDropdown === item.label && "text-signal bg-ink-800"
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      openDropdown === item.label && "rotate-180"
                    )}
                  />
                </button>

                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 w-72 animate-fade-in">
                    <div className="bg-ink-900 border border-ink-700 rounded-lg shadow-2xl overflow-hidden">
                      <div className="h-0.5 bg-signal/50" />
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href || "#"}
                          className="block px-5 py-4 hover:bg-ink-800 transition-colors border-b border-ink-800 last:border-0 group"
                        >
                          <span className="block text-sm font-semibold text-cream group-hover:text-signal transition-colors">
                            {child.label}
                          </span>
                          {child.description && (
                            <span className="block text-xs text-ink-400 mt-1 leading-relaxed">
                              {child.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href={localePath(locale, "/photowalks")}
              className="text-sm font-semibold text-cream/70 hover:text-signal transition-colors"
            >
              {dict.nav.nextWalk}
            </Link>
            <Link
              href={localePath(locale, "/membership")}
              className="px-5 py-2.5 bg-signal hover:bg-signal-light text-ink text-sm font-bold rounded-sm transition-colors"
            >
              {dict.nav.join}
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              className="p-2 text-cream"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={dict.nav.menu}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-ink-900 border-t border-ink-800 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.label}>
                <button
                  className="flex items-center justify-between w-full px-4 py-3 text-cream font-medium"
                  onClick={() =>
                    setMobileExpanded(
                      mobileExpanded === item.label ? null : item.label
                    )
                  }
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      mobileExpanded === item.label && "rotate-180"
                    )}
                  />
                </button>
                {mobileExpanded === item.label && item.children && (
                  <div className="pl-4 pb-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href || "#"}
                        className="block px-4 py-2.5 text-sm text-ink-300 hover:text-cream hover:bg-ink-800 rounded-md"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 px-4">
              <Link
                href={localePath(locale, "/membership")}
                className="block w-full text-center px-5 py-3 bg-signal text-ink font-bold rounded-sm"
                onClick={() => setMobileOpen(false)}
              >
                {dict.nav.joinCommunity}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const pathname = usePathname();
  const { locale, dict, content } = useLocale();

  if (pathname?.startsWith("/admin")) return null;

  const communityLinks = [
    { label: dict.nav.photowalks, href: localePath(locale, "/photowalks") },
    { label: dict.nav.map, href: localePath(locale, "/harta") },
    { label: dict.nav.gallery, href: localePath(locale, "/galerie") },
    { label: dict.nav.about, href: localePath(locale, "/despre") },
  ];

  const photoLinks = [
    { label: dict.nav.digital, href: localePath(locale, "/fotografie/digital") },
    { label: dict.nav.analog, href: localePath(locale, "/fotografie/analog") },
    { label: dict.nav.phone, href: localePath(locale, "/fotografie/telefon") },
    { label: dict.nav.guides, href: localePath(locale, "/ghiduri") },
  ];

  return (
    <footer className="bg-ink border-t border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-leica flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl text-cream">{dict.brand.name}</span>
            </div>
            <p className="text-ink-400 text-sm leading-relaxed">{dict.footer.about}</p>
            <div className="flex gap-4 mt-6">
              <a
                href={dict.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-400 hover:text-cream transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={dict.contact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-400 hover:text-cream transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-cream font-medium mb-4">{dict.footer.community}</h4>
            <ul className="space-y-2">
              {communityLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-400 hover:text-cream transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-cream font-medium mb-4">{dict.footer.photography}</h4>
            <ul className="space-y-2">
              {photoLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-400 hover:text-cream transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-cream font-medium mb-4">{content.newsletter.title}</h4>
            <p className="text-sm text-ink-400 mb-4">{content.newsletter.body}</p>
            <form
              className="flex gap-2"
              action={`mailto:${content.newsletter.contactEmail}?subject=${encodeURIComponent(content.newsletter.subject)}`}
              method="POST"
              encType="text/plain"
            >
              <input
                type="email"
                name="email"
                placeholder={content.newsletter.emailPlaceholder}
                className="flex-1 px-4 py-2.5 bg-ink-800 border border-ink-700 rounded-sm text-sm text-cream placeholder:text-ink-500 focus:outline-none focus:border-signal"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-signal hover:bg-signal-light text-ink text-sm font-bold rounded-sm transition-colors"
              >
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-500">{dict.footer.copyright}</p>
          <div className="flex gap-6 text-xs text-ink-500">
            <Link
              href={localePath(locale, "/termeni")}
              className="hover:text-cream transition-colors"
            >
              {dict.footer.terms}
            </Link>
            <Link
              href={localePath(locale, "/confidentialitate")}
              className="hover:text-cream transition-colors"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={localePath(locale, "/membership")}
              className="hover:text-cream transition-colors"
            >
              {dict.nav.membership}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
