import { cn } from "@/lib/utils";

type StreetlensMarkProps = {
  size?: number;
  className?: string;
  animate?: boolean;
};

/** Inline viewfinder mark — red brackets, cream lens, yellow tally. */
export function StreetlensMark({
  size = 44,
  className,
  animate = false,
}: StreetlensMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={cn("block", animate && "logo-mark-focus", className)}
      aria-hidden="true"
    >
      <path
        d="M22 34V22H34"
        stroke="#E20612"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 22H78V34"
        stroke="#E20612"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 66V78H34"
        stroke="#E20612"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 78H78V66"
        stroke="#E20612"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="67" y="24" width="7" height="7" rx="1" fill="#FFB800" />
      <circle cx="50" cy="50" r="19" stroke="#f8f4ef" strokeWidth="2.2" />
      <circle cx="50" cy="50" r="13.5" stroke="#f8f4ef" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="9" fill="#0a0a0a" />
      <path
        d="M46 44.5a5.5 5.5 0 1 1 2.2 10.8 4 4 0 0 0-1.8-7.2 4 4 0 0 0-2.4 3.4z"
        fill="#f8f4ef"
        opacity="0.92"
      />
    </svg>
  );
}

type StreetlensWordmarkProps = {
  className?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg" | "header";
};

const sizeClass = {
  sm: "text-lg",
  md: "text-xl lg:text-2xl",
  lg: "text-2xl",
  /* Fits header with RO + menu on ~320px; larger from sm up */
  header: "text-[1.35rem] sm:text-2xl lg:text-[1.75rem]",
} as const;

export function StreetlensWordmark({
  className,
  animate = false,
  size = "md",
}: StreetlensWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline leading-none tracking-tight text-cream whitespace-nowrap",
        sizeClass[size],
        animate && "logo-word-reveal",
        className
      )}
      aria-hidden="true"
    >
      <span className="font-normal">street</span>
      <span className="font-bold">lens</span>
    </span>
  );
}
