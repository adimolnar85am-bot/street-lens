import { AltFrameMark, AltFrameWordmark } from "@/components/AltFrameMark";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  height?: number;
  className?: string;
  variant?: "horizontal" | "mark" | "stacked" | "wordmark";
  animate?: boolean;
  inverted?: boolean;
  alt?: string;
};

export function BrandLogo({
  height = 44,
  className,
  variant = "wordmark",
  animate = false,
  inverted = false,
  alt = "alt:frame",
}: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label={alt}>
        <AltFrameMark size={height} />
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
        <AltFrameMark size={height} />
        <AltFrameWordmark size="lg" inverted={inverted} />
      </span>
    );
  }

  if (variant === "horizontal") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2.5 min-w-0 max-w-full",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <AltFrameMark size={height} className="shrink-0" />
        <AltFrameWordmark animate={animate} size="header" inverted={inverted} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex min-w-0", className)} role="img" aria-label={alt}>
      <AltFrameWordmark animate={animate} size="header" inverted={inverted} />
    </span>
  );
}
