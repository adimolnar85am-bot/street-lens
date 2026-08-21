import { getShopContent, getSiteContent } from "@/lib/content-server";
import { MerchCartView } from "@/components/MerchCartView";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const shop = getShopContent(locale);
  const contactEmail = getSiteContent().newsletter[locale].contactEmail;

  return (
    <MerchCartView
      locale={locale}
      homeLabel={dict.common.home}
      shopLabel={shop.pageTitle}
      contactEmail={contactEmail}
      shop={{
        pageTitle: shop.pageTitle,
        cartPageTitle: shop.cartPageTitle,
        cartPageBody: shop.cartPageBody,
        cartEmptyTitle: shop.cartEmptyTitle,
        cartEmptyBody: shop.cartEmptyBody,
        cartContinueShopping: shop.cartContinueShopping,
        cartQuantityLabel: shop.cartQuantityLabel,
        cartRemoveLabel: shop.cartRemoveLabel,
        cartSubtotalLabel: shop.cartSubtotalLabel,
        cartTotalLabel: shop.cartTotalLabel,
        cartCheckoutLabel: shop.cartCheckoutLabel,
        cartCheckoutHint: shop.cartCheckoutHint,
        oneSizeLabel: shop.oneSizeLabel,
        sizeFieldLabel: shop.sizeFieldLabel,
        cartPriceLabel: shop.cartPriceLabel,
        orderSubject: shop.orderSubject,
      }}
    />
  );
}
