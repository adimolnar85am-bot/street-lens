import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getPrintItems } from "@/lib/data-server";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const printItems = getPrintItems(dict);

  return (
    <div>
      <div className="bg-cream border-b border-ink-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/magazin")}
            className="inline-flex items-center gap-2 text-ink-500 hover:text-ink text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.shop.pageTitle}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-signal" />
            <h1 className="font-display text-4xl lg:text-6xl text-ink">
              {dict.shop.printPageTitle}
            </h1>
          </div>
          <p className="text-ink-500 max-w-2xl leading-relaxed">{dict.shop.printPageBody}</p>
        </div>
      </div>

      <div className="bg-cream min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {printItems.map((item) => (
              <div key={item.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 mb-4">
                  <ProtectedImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="text-ink font-medium">{item.name}</h2>
                <p className="text-ink-700 font-display text-xl mt-2">{item.price} RON</p>
                <a
                  href={`mailto:${dict.contact.email}?subject=${encodeURIComponent(dict.shop.orderSubject)}&body=${encodeURIComponent(item.name)}`}
                  className="mt-4 inline-block w-full py-2.5 bg-ink hover:bg-ink-800 text-cream text-sm font-medium rounded-sm transition-colors text-center"
                >
                  {dict.shop.addToCart}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-16 p-10 bg-ink rounded-2xl text-center">
            <p className="text-ink-400 max-w-lg mx-auto mb-6">{dict.shop.printSectionBody}</p>
            <a
              href={`mailto:${dict.contact.email}?subject=${encodeURIComponent(dict.shop.orderSubject)}&body=${encodeURIComponent(dict.shop.customPrint)}`}
              className="inline-block px-6 py-3 bg-signal hover:bg-signal-light text-ink text-sm font-bold rounded-sm transition-colors"
            >
              {dict.shop.customPrint}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
