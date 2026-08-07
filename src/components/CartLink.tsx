"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { localePath } from "@/i18n/navigation";
import { useCart } from "@/components/CartProvider";
import { cn } from "@/lib/utils";

export function CartLink({ className }: { className?: string }) {
  const { locale, dict } = useLocale();
  const { itemCount } = useCart();

  return (
    <Link
      href={localePath(locale, "/magazin/cos")}
      className={cn(
        "relative inline-flex items-center justify-center p-2 text-cream/70 hover:text-signal transition-colors",
        className
      )}
      aria-label={itemCount > 0 ? `${dict.nav.cart} (${itemCount})` : dict.nav.cart}
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-signal text-ink text-[10px] font-bold leading-none">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
