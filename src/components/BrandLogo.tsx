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
  /** On small screens show mark-only for horizontal. */
  responsive?: boolean;
  alt?: string;
};

export function BrandLogo({
  height = 40,
  className,
  variant = "horizontal",
  tagline,
  showTagline = false,
  animate = false,
  responsive = false,
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

  const markSize = Math.round(height * 0.95);

  return (
    <span
      className={cn("inline-flex items-center gap-2.5 sm:gap-3", className)}
      role="img"
      aria-label={alt}
    >
      <StreetlensMark size={markSize} animate={animate} />
      <span
        className={cn(
          "min-w-0 overflow-hidden",
          responsive ? "hidden sm:inline-flex" : "inline-flex"
        )}
      >
        <span className={cn(animate && "logo-word-clip")}>
          <StreetlensWordmark animate={animate} size="md" />
        </span>
      </span>
      {showTagline && tagline ? (
        <span className="hidden lg:block text-xs text-ink-400 tracking-widest uppercase max-w-[12rem] leading-snug">
          {tagline}
        </span>
      ) : null}
    </span>
  );
}
