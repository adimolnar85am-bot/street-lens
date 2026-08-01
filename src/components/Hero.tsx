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
    <section className="relative min-h-[88svh] flex items-end overflow-hidden protect-media">
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

      {/* Soft vignette + gradient — stronger on mobile, lighter on desktop */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,transparent_0%,rgba(23,23,23,0.35)_55%,rgba(23,23,23,0.75)_100%)] md:bg-none"
        aria-hidden
      />
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-ink/95 from-[18%] via-ink/75 via-[48%] to-transparent md:from-ink md:via-ink/55 md:to-ink/15 md:from-0% md:via-50% md:to-100%" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-14 lg:pb-20 w-full">
        <div className="max-w-2xl rounded-2xl border border-cream/10 bg-ink/40 backdrop-blur-sm px-4 py-5 sm:px-5 sm:py-6 md:border-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:rounded-none">
          <p className="text-signal/95 text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4">
            {dict.hero.locationBadge} · {dict.hero.eyebrow}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl text-cream mb-4 sm:mb-5 leading-[0.98] sm:leading-[0.95] drop-shadow-sm">
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cream/10 hover:bg-cream/15 text-cream font-medium rounded-sm backdrop-blur-md border border-cream/20 transition-colors text-sm w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4" />
              {dict.hero.ctaMap}
            </Link>
            <Link
              href={localePath(locale, "/concursuri")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-cream/85 hover:text-cream text-sm font-medium transition-colors w-full sm:w-auto sm:justify-start"
            >
              <Trophy className="w-4 h-4 text-signal shrink-0" />
              {content.hero.ctaContest}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-cream/80 border-t border-cream/10 pt-5">
            <Link
              href={localePath(locale, `/photowalks/${nextWalk.id}`)}
              className="hover:text-signal transition-colors"
            >
              <span className="text-cream/50">{dict.hero.nextLabel}:</span>{" "}
              {nextWalk.title}
            </Link>
            <span className="hidden sm:inline text-cream/30">·</span>
            <span className="hidden sm:inline">
              {photoCount} {dict.hero.archiveLabel}
            </span>
            <span className="hidden sm:inline text-cream/30">·</span>
            <span className="text-signal/90">
              {dict.hero.contestLabel} #{contest.themeNumber}
            </span>
          </div>
        </div>

        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-cream/40 sm:text-ink-500">
            {dict.hero.photoCredit}
          </p>

          <div
            className="flex items-center gap-2 sm:gap-2.5"
            role="tablist"
            aria-label="Slideshow hero"
          >
            <span className="text-xs text-cream/45 sm:text-ink-500 tabular-nums mr-1 hidden sm:inline">
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
                  i === active ? "w-8 bg-signal" : "w-1.5 bg-cream/35 hover:bg-cream/55"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
