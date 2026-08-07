"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { useCart } from "@/components/CartProvider";
import { cartLineKey } from "@/lib/cart.types";
import { buildMerchCartOrderBody, formatMerchSize } from "@/lib/merch-sizes";
import { localePath } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

type ShopCartCopy = {
  pageTitle: string;
  cartPageTitle: string;
  cartPageBody: string;
  cartEmptyTitle: string;
  cartEmptyBody: string;
  cartContinueShopping: string;
  cartQuantityLabel: string;
  cartRemoveLabel: string;
  cartSubtotalLabel: string;
  cartTotalLabel: string;
  cartCheckoutLabel: string;
  cartCheckoutHint: string;
  oneSizeLabel: string;
  sizeFieldLabel: string;
  cartPriceLabel: string;
  orderSubject: string;
};

type MerchCartViewProps = {
  locale: Locale;
  homeLabel: string;
  shopLabel: string;
  contactEmail: string;
  shop: ShopCartCopy;
};

export function MerchCartView({
  locale,
  homeLabel,
  shopLabel,
  contactEmail,
  shop,
}: MerchCartViewProps) {
  const { items, totalPrice, setQuantity, removeItem } = useCart();

  const checkoutHref =
    items.length > 0
      ? `mailto:${contactEmail}?subject=${encodeURIComponent(shop.orderSubject)}&body=${encodeURIComponent(
          buildMerchCartOrderBody(items, {
            oneSizeLabel: shop.oneSizeLabel,
            sizeFieldLabel: shop.sizeFieldLabel,
            quantityLabel: shop.cartQuantityLabel,
            priceLabel: shop.cartPriceLabel,
            totalLabel: shop.cartTotalLabel,
          })
        )}`
      : undefined;

  return (
    <div>
      <div className="bg-cream border-b border-ink-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/magazin")}
            className="inline-flex items-center gap-2 text-ink-500 hover:text-ink text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {shopLabel}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-signal" />
            <h1 className="font-display text-4xl lg:text-6xl text-ink">
              {shop.cartPageTitle}
            </h1>
          </div>
          <p className="text-ink-500 max-w-2xl leading-relaxed">{shop.cartPageBody}</p>
        </div>
      </div>

      <div className="bg-cream min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white border border-ink-200 rounded-2xl">
              <ShoppingBag className="w-12 h-12 text-ink-300 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-ink mb-3">{shop.cartEmptyTitle}</h2>
              <p className="text-ink-500 mb-8 max-w-md mx-auto">{shop.cartEmptyBody}</p>
              <Link
                href={localePath(locale, "/magazin")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink-800 text-cream text-sm font-medium rounded-sm transition-colors"
              >
                {shop.cartContinueShopping}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <ul className="divide-y divide-ink-200 bg-white border border-ink-200 rounded-2xl overflow-hidden">
                {items.map((item) => {
                  const key = cartLineKey(item);
                  return (
                    <li key={key} className="p-4 sm:p-6 flex gap-4 sm:gap-6">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-ink-100 shrink-0">
                        <ProtectedImage
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-ink font-medium">{item.name}</h2>
                        {item.size ? (
                          <p className="text-sm text-ink-500 mt-1">
                            {shop.sizeFieldLabel}:{" "}
                            {formatMerchSize(item.size, shop.oneSizeLabel)}
                          </p>
                        ) : null}
                        <p className="text-ink-700 font-display text-lg mt-2">
                          {item.price} RON
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-400 uppercase tracking-wider">
                              {shop.cartQuantityLabel}
                            </span>
                            <div className="inline-flex items-center border border-ink-200 rounded-sm">
                              <button
                                type="button"
                                onClick={() => setQuantity(key, item.quantity - 1)}
                                className="p-2 hover:bg-ink-50 text-ink-600 transition-colors"
                                aria-label={`${shop.cartQuantityLabel} -`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="min-w-[2rem] text-center text-sm font-medium text-ink">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(key, item.quantity + 1)}
                                className="p-2 hover:bg-ink-50 text-ink-600 transition-colors"
                                aria-label={`${shop.cartQuantityLabel} +`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(key)}
                            className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            {shop.cartRemoveLabel}
                          </button>
                        </div>
                      </div>
                      <p className="text-ink-700 font-medium shrink-0">
                        {item.price * item.quantity} RON
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="bg-white border border-ink-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-ink-500">{shop.cartSubtotalLabel}</span>
                  <span className="font-display text-2xl text-ink">{totalPrice} RON</span>
                </div>

                {checkoutHref ? (
                  <a
                    href={checkoutHref}
                    className="block w-full py-3.5 bg-signal hover:bg-signal-light text-ink text-sm font-bold rounded-sm transition-colors text-center"
                  >
                    {shop.cartCheckoutLabel}
                  </a>
                ) : null}

                <p className="text-xs text-ink-400 text-center mt-3">{shop.cartCheckoutHint}</p>

                <Link
                  href={localePath(locale, "/magazin")}
                  className="block text-center mt-6 text-sm text-ink-500 hover:text-ink transition-colors"
                >
                  {shop.cartContinueShopping}
                </Link>
              </div>
            </div>
          )}

          <p className="text-center mt-8">
            <Link
              href={localePath(locale, "/")}
              className="text-sm text-ink-400 hover:text-ink transition-colors"
            >
              ← {homeLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
