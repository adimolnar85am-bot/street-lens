import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { getPhotowalks } from "@/lib/data-server";
import { formatDate } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

export function PhotowalksSection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const photowalks = getPhotowalks(dict, locale);
  const latest = photowalks[0];

  return (
    <section className="py-20 lg:py-28 bg-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-signal/70 text-sm font-semibold tracking-widest uppercase mb-3">
              {dict.photowalks.eyebrow}
            </p>
            <h2 className="font-display text-3xl lg:text-5xl text-cream leading-tight mb-6">
              {dict.photowalks.title1}
              <br />
              {dict.photowalks.title2}
            </h2>
            <p className="text-ink-300 leading-relaxed mb-8">{dict.photowalks.body}</p>

            <div className="space-y-4 mb-8">
              {photowalks.map((walk) => (
                <Link
                  key={walk.id}
                  href={localePath(locale, `/photowalks/${walk.id}`)}
                  className="flex items-center gap-4 p-4 rounded-lg bg-ink-900 border border-ink-800 hover:border-ink-600 transition-colors group"
                >
                  <div className="relative w-20 h-14 rounded-md overflow-hidden flex-shrink-0">
                    <ProtectedImage
                      src={walk.coverImage}
                      alt={walk.title}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream font-medium text-sm truncate group-hover:text-signal/80 transition-colors">
                      {walk.title}
                    </p>
                    <p className="text-ink-400 text-xs mt-1">
                      {formatDate(walk.date)} · {walk.location}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-500 group-hover:text-signal/80 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>

            <Link
              href={localePath(locale, "/photowalks")}
              className="inline-flex items-center gap-2 text-signal/80 hover:text-cream text-sm font-medium transition-colors"
            >
              {dict.photowalks.seeAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <ProtectedImage
                src={latest.coverImage}
                alt={latest.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 bg-signal/15 text-signal text-xs font-medium rounded-sm mb-3">
                  {dict.photowalks.nextWalk}
                </span>
                <h3 className="font-display text-2xl text-cream mb-2">{latest.theme}</h3>
                <div className="flex items-center gap-4 text-sm text-ink-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {latest.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {latest.participantCount} {dict.photowalks.participants}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-ink-900 border border-ink-700 rounded-lg p-4 shadow-2xl">
              <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">
                {dict.photowalks.pinsOnMap}
              </p>
              <p className="text-3xl font-display text-cream">{latest.pins.length}+</p>
              <p className="text-ink-400 text-xs">{dict.photowalks.photosDocumented}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
