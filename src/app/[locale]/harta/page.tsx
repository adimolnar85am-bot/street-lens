import { PhotowalkMap } from "@/components/PhotowalkMap";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPhotowalks } from "@/lib/data-server";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HartaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const walks = getPhotowalks(dict, locale);

  return (
    <div>
      <div className="bg-ink-900 border-b border-ink-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-400 hover:text-cream text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <h1 className="font-display text-4xl lg:text-5xl text-cream">
            {dict.map.pageTitle}
          </h1>
        </div>
      </div>
      <PhotowalkMap walks={walks} />
    </div>
  );
}
