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
    <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden protect-media">
      {/* Slideshow — full viewport */}
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
                className="object-cover object-center pointer-events-none brightness-[0.58] saturate-[0.92] contrast-[1.05]"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          </div>
        ))}
        {/* Scrim uniform — expunere mai mică pe tot slide-ul */}
        <div className="absolute inset-0 z-[1] bg-ink/40 pointer-events-none" aria-hidden />
      </div>

      {/*
        Gradient de imbinare: poza sus, fade ușor spre jos unde e textul.
      */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none md:hidden"
        style={{
          background:
            "linear-gradient(to top, #171717 0%, rgba(23,23,23,0.94) 24%, rgba(23,23,23,0.62) 44%, rgba(23,23,23,0.22) 60%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(to top, #171717 0%, rgba(23,23,23,0.82) 38%, rgba(23,23,23,0.35) 58%, rgba(23,23,23,0.12) 75%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 lg:pb-20 w-full">
        <div className="max-w-3xl">
          <p className="text-signal text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase mb-3 sm:mb-5">
            {dict.hero.locationBadge} · {dict.hero.eyebrow}
          </p>

          <h1 className="font-display text-[2.75rem] leading-[0.92] sm:text-6xl lg:text-8xl text-cream mb-5 sm:mb-6 tracking-tight text-balance">
            {dict.hero.title1}{" "}
            <span className="text-signal">{dict.hero.title2}</span>
          </h1>

          <p className="text-sm sm:text-lg text-cream/85 leading-relaxed mb-7 sm:mb-8 max-w-xl">
            {content.hero.body}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-7 sm:mb-8">
            <Link
              href={localePath(locale, `/photowalks/${nextWalk.id}`)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-signal hover:bg-signal-light text-ink font-bold rounded-sm transition-colors text-sm"
            >
              {content.hero.ctaWalk}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={localePath(locale, "/harta")}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-cream/10 hover:bg-cream/15 text-cream font-medium rounded-sm backdrop-blur-sm border border-cream/20 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              {dict.hero.ctaMap}
            </Link>
            <Link
              href={localePath(locale, "/concursuri")}
              className="inline-flex items-center gap-2 px-2 py-3.5 text-cream/80 hover:text-cream text-sm font-medium transition-colors"
            >
              <Trophy className="w-4 h-4 text-signal/90" />
              {content.hero.ctaContest}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-cream/70 pt-5 border-t border-cream/10">
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

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[10px] tracking-[0.15em] uppercase text-cream/35 sm:text-ink-500">
            {dict.hero.photoCredit}
          </p>

          <div className="flex items-center gap-2.5" role="tablist" aria-label="Slideshow hero">
            <span className="text-xs text-cream/40 sm:text-ink-500 tabular-nums mr-1 hidden sm:inline">
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
