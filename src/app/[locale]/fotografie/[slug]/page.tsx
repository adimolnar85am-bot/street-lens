import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPhotoCategories } from "@/lib/data-server";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = ["digital", "analog", "telefon"];
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function FotografiePage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const photoCategories = getPhotoCategories(dict, locale);
  const category = photoCategories.find((c) => c.slug === slug);
  if (!category) notFound();

  const others = photoCategories.filter((c) => c.slug !== slug);

  return (
    <div>
      <div className="relative h-[50vh] min-h-[400px]">
        <ProtectedImage
          src={category.bannerImage}
          alt={category.title}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <Link
              href={localePath(locale, "/")}
              className="inline-flex items-center gap-2 text-ink-300 hover:text-cream text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {dict.common.home}
            </Link>
            <p className="text-signal/80 text-sm tracking-widest uppercase mb-2">
              {category.tagline}
            </p>
            <h1 className="font-display text-4xl lg:text-6xl text-cream">
              {category.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-ink-300 text-lg leading-relaxed max-w-3xl mb-16">
          {category.description}
        </p>

        <h2 className="font-display text-2xl lg:text-3xl text-cream mb-8">
          {dict.common.articles}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {category.articles.map((article) => (
            <article
              key={article.title}
              className="group bg-ink-900 rounded-xl overflow-hidden border border-ink-800 hover:border-ink-600 transition-colors"
            >
              <div className="relative aspect-[16/10]">
                <ProtectedImage
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <time className="text-xs text-ink-400">
                  {formatDate(article.date)}
                </time>
                <h3 className="font-display text-xl text-cream mt-2 group-hover:text-signal/80 transition-colors">
                  {article.title}
                </h3>
                <p className="text-ink-400 text-sm mt-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        <h2 className="font-display text-2xl text-cream mb-6">
          {dict.common.otherFormats}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map((cat) => (
            <Link
              key={cat.id}
              href={localePath(locale, `/fotografie/${cat.slug}`)}
              className="flex items-center gap-4 p-4 bg-ink-900 rounded-lg border border-ink-800 hover:border-ink-600 transition-colors group"
            >
              <div className="relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                <ProtectedImage
                  src={cat.heroImage}
                  alt={cat.title}
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div>
                <h3 className="text-cream font-medium group-hover:text-signal/80 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-ink-400 text-xs mt-1">{cat.tagline}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-500 ml-auto group-hover:text-signal/80 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
