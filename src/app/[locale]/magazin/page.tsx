import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getMerchItems } from "@/lib/data-server";
import { getShopContent, getSiteContent } from "@/lib/content-server";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MagazinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const shop = getShopContent(locale);
  const contactEmail = getSiteContent().newsletter[locale].contactEmail;
  const merchItems = getMerchItems(dict, locale);

  return (
    <div>
      <div className="bg-cream border-b border-ink-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-500 hover:text-ink text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-signal" />
            <h1 className="font-display text-4xl lg:text-6xl text-ink">
              {shop.pageTitle}
            </h1>
          </div>
          <p className="text-ink-500 max-w-2xl leading-relaxed">{shop.pageBody}</p>
        </div>
      </div>

      <div className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {merchItems.map((item) => (
              <div key={item.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 mb-4">
                  <ProtectedImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs text-ink-400 uppercase tracking-wider">
                  {item.category}
                </p>
                <h2 className="text-ink font-medium mt-1">{item.name}</h2>
                <p className="text-ink-700 font-display text-xl mt-2">
                  {item.price} RON
                </p>
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(shop.orderSubject)}&body=${encodeURIComponent(item.name)}`}
                  className="mt-4 block w-full py-2.5 bg-ink hover:bg-ink-800 text-cream text-sm font-medium rounded-sm transition-colors text-center"
                >
                  {shop.addToCart}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-20 p-10 lg:p-16 bg-ink rounded-2xl text-center">
            <h2 className="font-display text-3xl text-cream mb-4">
              {shop.printSectionTitle}
            </h2>
            <p className="text-ink-400 max-w-lg mx-auto mb-8">
              {shop.printSectionBody}
            </p>
            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(shop.orderSubject)}&body=${encodeURIComponent(shop.customPrint)}`}
              className="inline-block px-6 py-3 bg-signal hover:bg-signal-light text-ink text-sm font-bold rounded-sm transition-colors"
            >
              {shop.customPrint}
            </a>
            <Link
              href={localePath(locale, "/magazin/print")}
              className="ml-4 inline-block px-6 py-3 text-cream/70 hover:text-cream text-sm font-medium transition-colors"
            >
              {shop.sectionSeePrints}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
