import { cn } from "@/lib/utils";

type AltFrameMarkProps = {
  size?: number;
  className?: string;
};

/** Circle avatar mark — black disc with "alt:" for icon contexts. */
export function AltFrameMark({ size = 44, className }: AltFrameMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-ink shrink-0 font-bold lowercase tracking-tight text-cream",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.28 }}
      aria-hidden="true"
    >
      alt:
    </span>
  );
}

type AltFrameWordmarkProps = {
  className?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg" | "header";
  /** Light text for dark backgrounds (hero). */
  inverted?: boolean;
};

const sizeClass = {
  sm: "text-lg",
  md: "text-xl lg:text-2xl",
  lg: "text-2xl lg:text-3xl",
  header: "text-[1.35rem] sm:text-xl lg:text-[1.65rem]",
} as const;

export function AltFrameWordmark({
  className,
  animate = false,
  size = "md",
  inverted = false,
}: AltFrameWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline leading-none tracking-[-0.02em] whitespace-nowrap font-bold lowercase",
        inverted ? "text-cream" : "text-ink",
        sizeClass[size],
        animate && "logo-word-reveal",
        className
      )}
      aria-hidden="true"
    >
      <span>alt</span>
      <span className="text-scarlet">:</span>
      <span>frame</span>
    </span>
  );
}

/** Serif tagline — "see otherwise." */
export function AltFrameTagline({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-tagline text-scarlet lowercase tracking-normal",
        className
      )}
    >
      {children}
    </p>
  );
}
