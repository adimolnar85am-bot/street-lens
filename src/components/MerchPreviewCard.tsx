import Link from "next/link";
import { ProtectedImage } from "@/components/ProtectedImage";
import { formatMerchSizesSummary } from "@/lib/merch-sizes";
import type { MerchOrderItem } from "@/components/MerchOrderCard";
import { localePath } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

type MerchPreviewCardProps = {
  item: MerchOrderItem;
  locale: Locale;
  oneSizeLabel: string;
  sizesLabel: string;
};

export function MerchPreviewCard({
  item,
  locale,
  oneSizeLabel,
  sizesLabel,
}: MerchPreviewCardProps) {
  const sizesSummary = formatMerchSizesSummary(item.sizes, oneSizeLabel);

  return (
    <Link href={localePath(locale, "/magazin")} className="group">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-ink-100 mb-3">
        <ProtectedImage
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors" />
      </div>
      <p className="text-xs text-ink-400 uppercase tracking-wider">{item.category}</p>
      <h3 className="text-ink font-medium text-sm mt-1 group-hover:text-signal transition-colors">
        {item.name}
      </h3>
      <p className="text-ink-600 font-medium text-sm mt-1">{item.price} RON</p>
      {sizesSummary ? (
        <p className="text-[11px] text-ink-400 mt-1">
          {sizesLabel}: {sizesSummary}
        </p>
      ) : null}
    </Link>
  );
}
