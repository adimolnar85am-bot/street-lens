import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { getGalleryPreview } from "@/lib/data-server";
import { PHOTO_COPYRIGHT } from "@/lib/photos";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

export function GallerySection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const galleryPreview = getGalleryPreview(12);

  return (
    <section className="py-20 lg:py-28 bg-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-signal/70 text-sm font-semibold tracking-widest uppercase mb-3">
            {dict.gallery.eyebrow}
          </p>
          <h2 className="font-display text-3xl lg:text-5xl text-cream leading-tight mb-4">
            {dict.gallery.title}
          </h2>
          <p className="text-ink-400 max-w-xl mx-auto text-sm">
            {dict.gallery.body} {PHOTO_COPYRIGHT}
          </p>
        </div>

        <div
          className="columns-2 lg:columns-3 gap-4 space-y-4 protect-media"
          data-protect-media
        >
          {galleryPreview.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid group relative rounded-lg overflow-hidden"
            >
              <div
                className="relative w-full"
                style={{ aspectRatio: photo.aspectRatio }}
              >
                <ProtectedImage
                  src={photo.image}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-cream font-medium text-sm">{photo.title}</p>
                  <p className="text-ink-300 text-xs">{photo.photographer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={localePath(locale, "/galerie")}
            className="inline-flex items-center gap-2 px-6 py-3 border border-ink-600 hover:border-cream text-cream text-sm font-medium rounded-sm transition-colors"
          >
            {dict.gallery.seeAll}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
