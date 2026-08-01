import { Hero } from "@/components/Hero";
import { PhotoCategories } from "@/components/PhotoCategories";
import { PhotowalksSection } from "@/components/PhotowalksSection";
import { PhotowalkMap } from "@/components/PhotowalkMap";
import { ContestSection } from "@/components/ContestSection";
import { GallerySection } from "@/components/GallerySection";
import { MerchSection } from "@/components/MerchSection";
import { MembershipCTA } from "@/components/MembershipCTA";
import { getHeroSlides, getPhotoCount } from "@/lib/photos-server";
import { getPhotowalks, getActiveContest } from "@/lib/data-server";
import { getMembershipContent, getShopContent } from "@/lib/content-server";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const slides = getHeroSlides();
  const walks = getPhotowalks(dict, locale);
  const contest = getActiveContest(dict, locale);
  const photoCount = getPhotoCount();

  return (
    <>
      <Hero
        slides={slides}
        nextWalk={walks[0]}
        contest={contest}
        photoCount={photoCount}
      />
      <PhotoCategories locale={locale} dict={dict} />
      <PhotowalksSection locale={locale} dict={dict} />
      <PhotowalkMap walks={walks} />
      <ContestSection locale={locale} dict={dict} />
      <GallerySection locale={locale} dict={dict} />
      <MerchSection locale={locale} dict={dict} shop={getShopContent(locale)} />
      <MembershipCTA locale={locale} membership={getMembershipContent(locale)} />
    </>
  );
}
