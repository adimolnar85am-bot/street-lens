"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProtectedImage } from "@/components/ProtectedImage";
import { useCart } from "@/components/CartProvider";
import { useLocale } from "@/i18n/LocaleContext";
import { localePath } from "@/i18n/navigation";
import {
  formatMerchSize,
  formatMerchSizesSummary,
  isOneSizeProduct,
  productRequiresSizeSelection,
} from "@/lib/merch-sizes";
import { cn } from "@/lib/utils";

export type MerchOrderItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes?: string[];
};

type MerchOrderCardProps = {
  item: MerchOrderItem;
  addToCartLabel: string;
  addedToCartLabel: string;
  viewCartLabel: string;
  oneSizeLabel: string;
  sizesLabel: string;
  selectSizeLabel: string;
  className?: string;
};

export function MerchOrderCard({
  item,
  addToCartLabel,
  addedToCartLabel,
  viewCartLabel,
  oneSizeLabel,
  sizesLabel,
  selectSizeLabel,
  className,
}: MerchOrderCardProps) {
  const { locale } = useLocale();
  const { addItem } = useCart();
  const sizesSummary = formatMerchSizesSummary(item.sizes, oneSizeLabel);
  const needsSelection = productRequiresSizeSelection(item.sizes);
  const oneSize = isOneSizeProduct(item.sizes);

  const defaultSize = useMemo(() => {
    if (oneSize && item.sizes?.[0]) return item.sizes[0];
    return null;
  }, [oneSize, item.sizes]);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    needsSelection ? null : defaultSize
  );
  const [justAdded, setJustAdded] = useState(false);

  const orderSize = needsSelection ? selectedSize : defaultSize;
  const canAdd = !needsSelection || Boolean(selectedSize);

  function handleAddToCart() {
    if (!canAdd) return;
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: orderSize,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className={cn("group", className)}>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 mb-4">
        <ProtectedImage
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="text-xs text-ink-400 uppercase tracking-wider">{item.category}</p>
      <h2 className="text-ink font-medium mt-1">{item.name}</h2>
      <p className="text-ink-700 font-display text-xl mt-2">{item.price} RON</p>

      {sizesSummary ? (
        <div className="mt-3">
          <p className="text-[11px] text-ink-400 uppercase tracking-wider mb-2">
            {sizesLabel}
          </p>
          {needsSelection ? (
            <div className="flex flex-wrap gap-1.5">
              {item.sizes!.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[2.25rem] px-2.5 py-1.5 text-xs font-medium rounded-sm border transition-colors",
                    selectedSize === size
                      ? "bg-ink text-cream border-ink"
                      : "bg-cream text-ink-600 border-ink-200 hover:border-ink-400"
                  )}
                >
                  {formatMerchSize(size, oneSizeLabel)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">{sizesSummary}</p>
          )}
        </div>
      ) : null}

      {needsSelection && !selectedSize ? (
        <p className="mt-3 text-xs text-ink-400">{selectSizeLabel}</p>
      ) : null}

      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAddToCart}
        className={cn(
          "mt-4 block w-full py-2.5 text-sm font-medium rounded-sm transition-colors text-center",
          canAdd
            ? justAdded
              ? "bg-signal text-ink"
              : "bg-ink hover:bg-ink-800 text-cream"
            : "bg-ink-200 text-ink-400 cursor-not-allowed"
        )}
      >
        {justAdded ? addedToCartLabel : addToCartLabel}
      </button>

      {justAdded ? (
        <Link
          href={localePath(locale, "/magazin/cos")}
          className="mt-2 block text-center text-xs text-ink-500 hover:text-signal transition-colors"
        >
          {viewCartLabel} →
        </Link>
      ) : null}
    </div>
  );
}
