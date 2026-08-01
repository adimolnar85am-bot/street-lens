"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Trophy } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import type { HeroSlide } from "@/lib/photos";
import type { Contest, Photowalk } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import { localePath } from "@/i18n/navigation";

const SLIDE_MS = 7000;

interface HeroProps {
  slides: HeroSlide[];
  nextWalk: Photowalk;
  contest: Contest;
  photoCount: number;
}

function SlideDots({
  slides,
  active,
  onSelect,
  slideLabel,
  className,
}: {
  slides: HeroSlide[];
  active: number;
  onSelect: (i: number) => void;
  slideLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="tablist"
      aria-label="Slideshow hero"
    >
      {slides.map((slide, i) => (
        <button
          key={slide.src}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`${slideLabel} ${i + 1}`}
          onClick={() => onSelect(i)}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i === active ? "w-8 bg-signal" : "w-1.5 bg-cream/40 hover:bg-cream/60"
          )}
        />
      ))}
    </div>
  );
}

export function Hero({ slides, nextWalk, contest, photoCount }: HeroProps) {
  const { locale, dict, content } = useLocale();
  const [active, setActive] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, slides.length]);

  return (
    <section className="relative overflow-hidden protect-media md:min-h-[88vh]">
      {/* Photo — top half on mobile, full bleed on desktop */}
      <div className="relative h-[44svh] min-h-[220px] max-h-[420px] md:absolute md:inset-0 md:h-full md:max-h-none">
        <div className="absolute inset-0" data-protect-media>
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1400ms] ease-in-out",
                i === active ? "opacity-100 z-[1]" : "opacity-0 z-0"
              )}
              aria-hidden={i !== active}
            >
              <div
                className={cn(
                  "absolute inset-0 will-change-transform",
                  i === active && !prefersReducedMotion && "hero-kenburns"
                )}
                style={
                  i === active && !prefersReducedMotion
                    ? { animationDuration: `${SLIDE_MS}ms` }
                    : undefined
                }
              >
                <ProtectedImage
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center pointer-events-none"
                  priority={i === 0}
                  sizes="100vw"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink to-transparent md:hidden pointer-events-none" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15 pointer-events-none" />

        <SlideDots
          slides={slides}
          active={active}
          onSelect={setActive}
          slideLabel={dict.hero.slideLabel}
          className="absolute bottom-3 left-0 right-0 z-10 md:hidden"
        />
      </div>

      {/* Copy — solid panel on mobile, overlay on desktop */}
      <div className="relative bg-ink md:absolute md:inset-0 md:z-10 md:flex md:items-end md:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8 md:pb-14 lg:pb-20 w-full">
          <div className="max-w-2xl">
            <p className="text-signal text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4">
              {dict.hero.locationBadge} · {dict.hero.eyebrow}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl text-cream mb-4 sm:mb-5 leading-[0.98] sm:leading-[0.95]">
              {dict.hero.title1}
              <br />
              <span className="text-signal">{dict.hero.title2}</span>
            </h1>
            <p className="text-sm sm:text-lg text-cream/90 leading-relaxed mb-6 sm:mb-8 max-w-xl">
              {content.hero.body}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-4 mb-6 sm:mb-8">
              <Link
                href={localePath(locale, `/photowalks/${nextWalk.id}`)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-signal hover:bg-signal-light text-ink font-bold rounded-sm transition-colors text-sm w-full sm:w-auto"
              >
                {content.hero.ctaWalk}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={localePath(locale, "/harta")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cream/15 hover:bg-cream/20 text-cream font-medium rounded-sm border border-cream/20 transition-colors text-sm w-full sm:w-auto"
              >
                <MapPin className="w-4 h-4" />
                {dict.hero.ctaMap}
              </Link>
              <Link
                href={localePath(locale, "/concursuri")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-cream hover:text-signal text-sm font-medium transition-colors w-full sm:w-auto sm:justify-start"
              >
                <Trophy className="w-4 h-4 text-signal shrink-0" />
                {content.hero.ctaContest}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-cream/75 border-t border-cream/10 pt-5">
              <Link
                href={localePath(locale, `/photowalks/${nextWalk.id}`)}
                className="hover:text-signal transition-colors"
              >
                <span className="text-cream/45">{dict.hero.nextLabel}:</span>{" "}
                {nextWalk.title}
              </Link>
              <span className="hidden sm:inline text-cream/25">·</span>
              <span className="hidden sm:inline">
                {photoCount} {dict.hero.archiveLabel}
              </span>
              <span className="hidden sm:inline text-cream/25">·</span>
              <span className="text-signal/90">
                {dict.hero.contestLabel} #{contest.themeNumber}
              </span>
            </div>
          </div>

          <div className="mt-8 hidden md:flex items-center justify-between gap-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-ink-500">
              {dict.hero.photoCredit}
            </p>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-ink-500 tabular-nums mr-1">
                {String(active + 1).padStart(2, "0")}
                {dict.hero.frameOf}
                {String(slides.length).padStart(2, "0")}
              </span>
              <SlideDots
                slides={slides}
                active={active}
                onSelect={setActive}
                slideLabel={dict.hero.slideLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
