import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  showText?: boolean;
  name?: string;
  tagline?: string;
};

export function BrandLogo({
  size = 40,
  className,
  showText = false,
  name = "Street Lens",
  tagline,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/logo.svg"
        alt={name}
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
      {showText ? (
        <span className="min-w-0">
          <span className="block font-display text-xl lg:text-2xl text-cream leading-none">
            {name}
          </span>
          {tagline ? (
            <span className="hidden sm:block text-xs text-ink-400 tracking-widest uppercase mt-1">
              {tagline}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
