import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { getPhotowalks } from "@/lib/data-server";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { PhotowalkMap } from "@/components/PhotowalkMap";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  const ids = ["pw-1", "pw-2"];
  return locales.flatMap((locale) => ids.map((id) => ({ locale, id })));
}

export default async function PhotowalkDetailPage({ params }: Props) {
  const { locale: localeParam, id } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const photowalks = getPhotowalks(dict);
  const walk = photowalks.find((w) => w.id === id);
  if (!walk) notFound();

  return (
    <div>
      <div className="relative h-[60vh] min-h-[450px]">
        <ProtectedImage
          src={walk.coverImage}
          alt={walk.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <Link
              href={localePath(locale, "/photowalks")}
              className="inline-flex items-center gap-2 text-ink-300 hover:text-cream text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {dict.photowalks.allWalks}
            </Link>
            <span className="inline-block px-3 py-1 bg-signal/15 text-signal text-xs font-medium rounded-sm mb-3">
              {walk.theme}
            </span>
            <h1 className="font-display text-4xl lg:text-5xl text-cream mb-4">
              {walk.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-ink-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(walk.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {walk.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {walk.participantCount} {dict.photowalks.participants}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-ink-300 text-lg leading-relaxed max-w-3xl mb-12">
          {walk.description}
        </p>

        <h2 className="font-display text-2xl text-cream mb-6">
          {dict.photowalks.trailPhotos}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {walk.pins.map((pin) => (
            <div
              key={pin.id}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden"
            >
              <ProtectedImage
                src={pin.image}
                alt={pin.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-cream font-medium text-sm">{pin.title}</p>
                <p className="text-ink-300 text-xs">{pin.photographer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PhotowalkMap walks={photowalks} />
    </div>
  );
}
