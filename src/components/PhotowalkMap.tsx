"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ProtectedImage } from "@/components/ProtectedImage";
import { MapPin, X } from "lucide-react";
import type { Photowalk, PhotowalkPin } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import { localePath } from "@/i18n/navigation";

const MapContainer = dynamic(
  () => import("./PhotowalkMapInner").then((m) => m.PhotowalkMapInner),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  const { dict } = useLocale();
  return (
    <div className="w-full h-full bg-ink-900 flex items-center justify-center">
      <p className="text-ink-400 text-sm">{dict.map.loading}</p>
    </div>
  );
}

export function PhotowalkMap({ walks }: { walks: Photowalk[] }) {
  const { locale, dict } = useLocale();
  const [selectedWalk, setSelectedWalk] = useState(walks[0]?.id || "");
  const [selectedPin, setSelectedPin] = useState<PhotowalkPin | null>(null);

  if (!walks.length) return null;

  const walk = walks.find((w) => w.id === selectedWalk) || walks[0];

  return (
    <section className="py-20 lg:py-28 bg-warm section-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-signal/70 text-sm font-semibold tracking-widest uppercase mb-3">
            {dict.map.eyebrow}
          </p>
          <h2 className="font-display text-3xl lg:text-5xl text-ink leading-tight mb-4">
            {dict.map.title}
          </h2>
          <p className="text-ink-500 max-w-2xl mx-auto text-sm leading-relaxed">
            {dict.map.body}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {walks.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                setSelectedWalk(w.id);
                setSelectedPin(null);
              }}
              className={cn(
                "px-4 py-2 text-sm rounded-full border transition-colors",
                selectedWalk === w.id
                  ? "bg-ink text-cream border-ink"
                  : "bg-cream text-ink-600 border-ink-200 hover:border-ink-400"
              )}
            >
              {w.theme}
            </button>
          ))}
        </div>

        <div className="relative rounded-xl overflow-hidden border border-ink-200 shadow-xl">
          <div className="h-[450px] lg:h-[550px]">
            <MapContainer
              center={walk.center}
              pins={walk.pins}
              onPinClick={setSelectedPin}
              selectedPinId={selectedPin?.id}
            />
          </div>

          {selectedPin && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-cream rounded-lg shadow-2xl overflow-hidden animate-fade-in z-[1000]">
              <button
                onClick={() => setSelectedPin(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-ink/80 rounded-full flex items-center justify-center text-cream hover:bg-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="relative aspect-[16/10]">
                <ProtectedImage
                  src={selectedPin.image}
                  alt={selectedPin.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-display text-lg text-ink">{selectedPin.title}</h4>
                <p className="text-sm text-ink-500 mt-1">{selectedPin.photographer}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-ink-400">
                  <MapPin className="w-3 h-3" />
                  {selectedPin.theme}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-500">
            <span className="font-medium text-ink">{walk.pins.length}</span>{" "}
            {dict.map.pinsOnTrail} „{walk.theme}”
          </p>
          <Link
            href={localePath(locale, "/membership")}
            className="px-5 py-2.5 bg-signal hover:bg-signal-light text-ink text-sm font-medium rounded-sm transition-colors"
          >
            {dict.map.addPin}
          </Link>
        </div>
      </div>
    </section>
  );
}
