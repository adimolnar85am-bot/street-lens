import { StreetlensMark, StreetlensWordmark } from "@/components/StreetlensMark";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Mark size in px. */
  height?: number;
  className?: string;
  /** horizontal = mark + wordmark side by side; mark = icon only; stacked = mark over wordmark */
  variant?: "horizontal" | "mark" | "stacked";
  tagline?: string;
  showTagline?: boolean;
  /** Animate wordmark emerging from the mark (header). */
  animate?: boolean;
  alt?: string;
};

export function BrandLogo({
  height = 44,
  className,
  variant = "horizontal",
  tagline,
  showTagline = false,
  animate = false,
  alt = "streetlens",
}: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label={alt}>
        <StreetlensMark size={height} animate={animate} />
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span
        className={cn("inline-flex flex-col items-center gap-2", className)}
        role="img"
        aria-label={alt}
      >
        <StreetlensMark size={height} animate={animate} />
        <span className={cn(animate && "logo-word-reveal-down")}>
          <StreetlensWordmark size="lg" />
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 min-w-0 max-w-full",
        className
      )}
      role="img"
      aria-label={alt}
    >
      <StreetlensMark
        size={height}
        animate={animate}
        className="shrink-0"
      />
      <span className="min-w-0 overflow-hidden inline-flex">
        <StreetlensWordmark animate={animate} size="header" />
      </span>
      {showTagline && tagline ? (
        <span className="hidden xl:block text-xs text-ink-400 tracking-widest uppercase max-w-[11rem] leading-snug shrink-0">
          {tagline}
        </span>
      ) : null}
    </span>
  );
}
