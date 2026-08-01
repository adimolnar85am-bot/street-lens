"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Trophy } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import type { HeroSlide } from "@/lib/photos";
import type { Contest, Photowalk } from "@/lib/data";
import { formatDate } from "@/lib/utils";
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
    <section className="relative min-h-[88vh] flex items-end overflow-hidden protect-media">
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

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-ink via-ink/55 to-ink/15 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-20 w-full">
        <div className="max-w-2xl">
          <p className="text-signal/90 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            {dict.hero.locationBadge} · {dict.hero.eyebrow}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl text-cream mb-5 leading-[0.95]">
            {dict.hero.title1}
            <br />
            <span className="text-signal">{dict.hero.title2}</span>
          </h1>
          <p className="text-base sm:text-lg text-ink-200/95 leading-relaxed mb-8 max-w-xl">
            {content.hero.body}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
            <Link
              href={localePath(locale, `/photowalks/${nextWalk.id}`)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-signal hover:bg-signal-light text-ink font-bold rounded-sm transition-colors text-sm"
            >
              {content.hero.ctaWalk}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={localePath(locale, "/harta")}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-cream/10 hover:bg-cream/15 text-cream font-medium rounded-sm backdrop-blur-sm border border-cream/15 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              {dict.hero.ctaMap}
            </Link>
            <Link
              href={localePath(locale, "/concursuri")}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-cream/75 hover:text-cream text-sm font-medium transition-colors"
            >
              <Trophy className="w-4 h-4 text-signal/80" />
              {content.hero.ctaContest}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-ink-300/90 border-t border-cream/10 pt-5">
            <Link
              href={localePath(locale, `/photowalks/${nextWalk.id}`)}
              className="hover:text-signal transition-colors"
            >
              <span className="text-ink-500">{dict.hero.nextLabel}:</span>{" "}
              {nextWalk.title}
            </Link>
            <span className="hidden sm:inline text-ink-600">·</span>
            <span>
              {photoCount} {dict.hero.archiveLabel}
            </span>
            <span className="hidden sm:inline text-ink-600">·</span>
            <span className="text-signal/90">
              {dict.hero.contestLabel} #{contest.themeNumber}
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-ink-500">
            {dict.hero.photoCredit}
          </p>

          <div
            className="flex items-center gap-2 sm:gap-2.5"
            role="tablist"
            aria-label="Slideshow hero"
          >
            <span className="text-xs text-ink-500 tabular-nums mr-1 hidden sm:inline">
              {String(active + 1).padStart(2, "0")}
              {dict.hero.frameOf}
              {String(slides.length).padStart(2, "0")}
            </span>
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`${dict.hero.slideLabel} ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === active ? "w-8 bg-signal" : "w-1.5 bg-cream/30 hover:bg-cream/55"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
