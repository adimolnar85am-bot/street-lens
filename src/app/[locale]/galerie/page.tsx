import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryClient } from "@/components/GalleryClient";
import { getGalleryPhotos } from "@/lib/photos-server";
import { PHOTO_COPYRIGHT } from "@/lib/photos";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GaleriePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const photos = getGalleryPhotos();

  return (
    <div>
      <div className="bg-ink-900 border-b border-ink-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-400 hover:text-cream text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <h1 className="font-display text-4xl lg:text-6xl text-cream mb-4">
            {dict.gallery.pageTitle}
          </h1>
          <p className="text-ink-300 max-w-2xl leading-relaxed">
            {photos.length} {dict.gallery.pageBody}
          </p>
          <p className="text-ink-500 text-xs mt-3">{PHOTO_COPYRIGHT}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GalleryClient photos={photos} />
      </div>
    </div>
  );
}
