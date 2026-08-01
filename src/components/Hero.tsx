"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Users } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import type { HeroSlide } from "@/lib/photos";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import { localePath } from "@/i18n/navigation";

const SLIDE_MS = 7000;

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const { locale, dict } = useLocale();
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
    <section className="relative min-h-[85vh] flex items-end overflow-hidden protect-media">
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

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-ink via-ink/60 to-ink/25 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 w-full">
        <div className="max-w-3xl animate-fade-up">
          <p className="text-signal/80 text-sm font-semibold tracking-widest uppercase mb-4">
            {dict.hero.eyebrow}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl text-cream mb-6">
            {dict.hero.title1}
            <br />
            <span className="text-signal">{dict.hero.title2}</span>
          </h1>
          <p className="text-lg text-ink-200 leading-relaxed mb-8 max-w-xl">
            {dict.hero.body}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={localePath(locale, "/photowalks")}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-signal hover:bg-signal-light text-ink font-bold rounded-sm transition-colors"
            >
              {dict.hero.ctaWalk}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={localePath(locale, "/harta")}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-cream/10 hover:bg-cream/20 text-cream font-medium rounded-sm backdrop-blur-sm border border-cream/20 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {dict.hero.ctaMap}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            {[
              { icon: Calendar, label: dict.hero.statWalkLabel, value: dict.hero.statWalk },
              { icon: Users, label: dict.hero.statMembersLabel, value: dict.hero.statMembers },
              { icon: MapPin, label: dict.hero.statWalksLabel, value: dict.hero.statWalks },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center lg:text-left">
                <Icon className="w-5 h-5 text-signal mx-auto lg:mx-0 mb-2" />
                <p className="text-cream font-medium text-sm">{value}</p>
                <p className="text-ink-400 text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Slideshow hero"
          >
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
                  i === active
                    ? "w-8 bg-signal"
                    : "w-1.5 bg-cream/35 hover:bg-cream/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
