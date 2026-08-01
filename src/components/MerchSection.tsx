import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getMerchItems } from "@/lib/data-server";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import type { SiteContent } from "@/lib/content.types";

type ShopContent = ReturnType<
  typeof import("@/lib/content-server").getShopContent
>;

export function MerchSection({
  locale,
  dict,
  shop,
}: {
  locale: Locale;
  dict: Dictionary;
  shop: ShopContent;
}) {
  const merchItems = getMerchItems(dict, locale);

  return (
    <section className="py-20 lg:py-28 bg-cream section-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <p className="text-signal/70 text-sm font-semibold tracking-widest uppercase mb-3">
              {shop.sectionEyebrow}
            </p>
            <h2 className="font-display text-3xl lg:text-5xl text-ink leading-tight">
              {shop.sectionTitle}
            </h2>
          </div>
          <Link
            href={localePath(locale, "/magazin")}
            className="mt-4 lg:mt-0 inline-flex items-center gap-2 text-ink-600 hover:text-signal text-sm font-medium transition-colors"
          >
            {shop.sectionSeeAll}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {merchItems.map((item) => (
            <Link key={item.id} href={localePath(locale, "/magazin")} className="group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-ink-100 mb-3">
                <ProtectedImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors" />
              </div>
              <p className="text-xs text-ink-400 uppercase tracking-wider">
                {item.category}
              </p>
              <h3 className="text-ink font-medium text-sm mt-1 group-hover:text-signal transition-colors">
                {item.name}
              </h3>
              <p className="text-ink-600 font-medium text-sm mt-1">{item.price} RON</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-8 lg:p-12 bg-ink rounded-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-signal/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-signal/80" />
            </div>
            <div>
              <h3 className="font-display text-xl text-cream">{shop.sectionPrintTitle}</h3>
              <p className="text-ink-400 text-sm mt-1">{shop.sectionPrintBody}</p>
            </div>
          </div>
          <Link
            href={localePath(locale, "/magazin/print")}
            className="px-6 py-3 bg-signal hover:bg-signal-light text-ink text-sm font-bold rounded-sm transition-colors whitespace-nowrap"
          >
            {shop.sectionSeePrints}
          </Link>
        </div>
      </div>
    </section>
  );
}
