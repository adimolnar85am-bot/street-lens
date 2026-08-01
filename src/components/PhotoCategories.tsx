import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowRight, Aperture, Film, Smartphone } from "lucide-react";
import { getPhotoCategories } from "@/lib/data-server";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

const icons = {
  digital: Aperture,
  analog: Film,
  telefon: Smartphone,
};

export function PhotoCategories({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const photoCategories = getPhotoCategories(dict, locale);

  return (
    <section className="py-20 lg:py-28 bg-cream section-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <p className="text-signal/70 text-sm font-semibold tracking-widest uppercase mb-3">
            {dict.formats.eyebrow}
          </p>
          <h2 className="font-display text-3xl lg:text-5xl text-ink leading-tight mb-4">
            {dict.formats.title}
          </h2>
          <p className="text-ink-600 text-base leading-relaxed max-w-lg">
            {dict.formats.body}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {photoCategories.map((cat, i) => {
            const Icon = icons[cat.id as keyof typeof icons];
            return (
              <Link
                key={cat.id}
                href={localePath(locale, `/fotografie/${cat.slug}`)}
                className="group relative overflow-hidden rounded-lg bg-ink aspect-[3/4] lg:aspect-[4/5]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <ProtectedImage
                  src={cat.heroImage}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

                <div className="absolute top-6 left-6">
                  <div className="w-10 h-10 bg-cream/10 backdrop-blur-sm rounded-sm flex items-center justify-center border border-cream/20">
                    <Icon className="w-5 h-5 text-cream" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <p className="text-signal/80 text-xs tracking-widest uppercase mb-2">
                    {cat.tagline}
                  </p>
                  <h3 className="font-display text-2xl lg:text-3xl text-cream mb-3">
                    {cat.title}
                  </h3>
                  <p className="text-ink-300 text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-cream text-sm font-medium group-hover:text-signal/80 transition-colors">
                    {dict.formats.explore}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
