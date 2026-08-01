"use client";

import { useMemo, useState } from "react";
import { ProtectedImage } from "@/components/ProtectedImage";
import type { GalleryPhoto } from "@/lib/photos";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";

export function GalleryClient({ photos }: { photos: GalleryPhoto[] }) {
  const { dict } = useLocale();
  const filters = [
    { id: "all" as const, label: dict.gallery.all },
    { id: "digital" as const, label: dict.gallery.digital },
    { id: "analog" as const, label: dict.gallery.analog },
    { id: "telefon" as const, label: dict.gallery.phone },
  ];

  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return photos;
    return photos.filter((p) => p.category === filter);
  }, [filter, photos]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-4 py-2 text-sm rounded-full border transition-colors",
              filter === f.id
                ? "bg-signal text-ink border-signal font-semibold"
                : "bg-ink-900 text-ink-300 border-ink-700 hover:border-ink-500"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        className="columns-2 lg:columns-3 gap-4 space-y-4 protect-media"
        data-protect-media
      >
        {filtered.map((photo) => (
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
                className="object-cover object-center pointer-events-none"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-cream font-medium text-sm">{photo.title}</p>
                <p className="text-ink-300 text-xs">{photo.photographer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
