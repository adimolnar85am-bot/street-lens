import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LocaleProvider } from "@/i18n/LocaleContext";
import { HtmlLang } from "@/components/HtmlLang";
import { Header, Footer } from "@/components/Header";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteContent } from "@/lib/content-server";
import { hydratePhotoStorage } from "@/lib/photos-server";
import { hydrateMerchStorage } from "@/lib/merch-photos-server";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    title: dict.meta.title,
    description: dict.meta.description,
    ogTitle: `${dict.brand.name} — ${dict.meta.ogHeadline}`,
    ogDescription: dict.meta.ogTagline,
    manifest: "/manifest.webmanifest",
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  await hydratePhotoStorage();
  await hydrateMerchStorage();
  const dict = await getDictionary(locale);
  const site = getSiteContent();
  const content = {
    newsletter: site.newsletter[locale],
    hero: site.hero[locale],
  };

  return (
    <LocaleProvider locale={locale} dict={dict} content={content}>
      <OrganizationJsonLd />
      <HtmlLang />
      <Header />
      <main>{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
