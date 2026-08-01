import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO = {
  horizontal: { src: "/logo.svg", width: 320, height: 80 },
  mark: { src: "/logo-mark.svg", width: 100, height: 100 },
  stacked: { src: "/logo-stacked.svg", width: 512, height: 512 },
} as const;

type BrandLogoProps = {
  /** Visual height in px; width follows the asset aspect ratio. */
  height?: number;
  className?: string;
  variant?: keyof typeof LOGO;
  tagline?: string;
  showTagline?: boolean;
  /** On small screens, show mark-only when variant is horizontal. */
  responsive?: boolean;
  priority?: boolean;
  alt?: string;
};

export function BrandLogo({
  height = 40,
  className,
  variant = "horizontal",
  tagline,
  showTagline = false,
  responsive = false,
  priority = false,
  alt = "streetlens",
}: BrandLogoProps) {
  const asset = LOGO[variant];
  const width = Math.round((height * asset.width) / asset.height);

  const logoImage = (src: string, w: number, h: number, extraClass?: string) => (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      className={cn("shrink-0", extraClass)}
      priority={priority}
    />
  );

  if (variant === "horizontal" && responsive) {
    const markSize = Math.round(height * 0.9);
    return (
      <span className={cn("inline-flex items-center gap-3", className)}>
        {logoImage(LOGO.mark.src, markSize, markSize, "sm:hidden")}
        {logoImage(asset.src, width, height, "hidden sm:block")}
        {showTagline && tagline ? (
          <span className="hidden lg:block text-xs text-ink-400 tracking-widest uppercase max-w-[12rem] leading-snug">
            {tagline}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {logoImage(asset.src, width, height)}
      {showTagline && tagline && variant === "horizontal" ? (
        <span className="hidden lg:block text-xs text-ink-400 tracking-widest uppercase max-w-[12rem] leading-snug">
          {tagline}
        </span>
      ) : null}
    </span>
  );
}
