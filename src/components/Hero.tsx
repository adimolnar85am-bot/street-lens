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
    <section className="relative min-h-[82svh] sm:min-h-[88vh] flex items-end overflow-hidden protect-media">
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

      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-ink from-[35%] via-ink/90 via-[72%] to-ink/50 md:from-ink md:via-ink/55 md:to-ink/15 md:from-0% md:via-50% md:to-100%" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-14 lg:pb-20 w-full">
        <div className="max-w-2xl rounded-2xl bg-ink/90 backdrop-blur-md px-4 py-5 sm:px-5 sm:py-6 md:bg-transparent md:backdrop-blur-none md:p-0 md:rounded-none border border-cream/10 md:border-0 shadow-xl md:shadow-none">
          <p className="text-signal text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4">
            {dict.hero.locationBadge} · {dict.hero.eyebrow}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl text-cream mb-4 sm:mb-5 leading-[0.98] sm:leading-[0.95]">
            {dict.hero.title1}
            <br />
            <span className="text-signal">{dict.hero.title2}</span>
          </h1>
          <p className="text-sm sm:text-lg text-cream/90 leading-relaxed mb-6 sm:mb-8 max-w-xl line-clamp-4 sm:line-clamp-none">
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

          <div className="hidden sm:flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-cream/80 border-t border-cream/10 pt-5">
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
            <span className="text-signal">
              {dict.hero.contestLabel} #{contest.themeNumber}
            </span>
          </div>

          <p className="sm:hidden text-xs text-cream/70 mt-4 pt-4 border-t border-cream/10">
            <span className="text-cream/50">{dict.hero.nextLabel}:</span>{" "}
            {nextWalk.title}
          </p>
        </div>

        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 px-1 sm:px-0">
          <p className="hidden sm:block text-[10px] tracking-[0.15em] uppercase text-ink-500">
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
