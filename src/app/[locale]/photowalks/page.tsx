import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Users } from "lucide-react";
import { getPhotowalks } from "@/lib/data-server";
import { formatDate } from "@/lib/utils";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PhotowalksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const photowalks = getPhotowalks(dict);

  return (
    <div className="min-h-screen">
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
            {dict.photowalks.pageTitle}
          </h1>
          <p className="text-ink-300 max-w-2xl leading-relaxed">
            {dict.photowalks.pageBody}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {photowalks.map((walk) => (
            <Link
              key={walk.id}
              href={localePath(locale, `/photowalks/${walk.id}`)}
              className="group bg-ink-900 rounded-xl overflow-hidden border border-ink-800 hover:border-ink-600 transition-colors"
            >
              <div className="relative aspect-[16/9]">
                <ProtectedImage
                  src={walk.coverImage}
                  alt={walk.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-signal/15 text-signal text-xs font-medium rounded-sm mb-2">
                    {walk.theme}
                  </span>
                  <h2 className="font-display text-2xl text-cream">{walk.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-ink-300 text-sm leading-relaxed mb-4">
                  {walk.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-ink-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(walk.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {walk.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {walk.participantCount} {dict.photowalks.participants}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
