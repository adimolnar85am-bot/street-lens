import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getPhotoCategories } from "@/lib/data-server";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GhiduriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const categories = getPhotoCategories(dict);

  return (
    <div>
      <div className="bg-warm border-b border-ink-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-500 hover:text-ink text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-signal" />
            <h1 className="font-display text-4xl lg:text-6xl text-ink">
              {dict.guides.pageTitle}
            </h1>
          </div>
          <p className="text-ink-500 max-w-2xl leading-relaxed">{dict.guides.pageBody}</p>
        </div>
      </div>

      <div className="bg-warm min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {categories.map((cat) => (
            <section key={cat.id}>
              <div className="flex items-end justify-between mb-8">
                <h2 className="font-display text-2xl lg:text-3xl text-ink">{cat.title}</h2>
                <Link
                  href={localePath(locale, `/fotografie/${cat.slug}`)}
                  className="text-sm text-ink-500 hover:text-signal transition-colors"
                >
                  {dict.guides.readArticle} →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cat.articles.map((article) => (
                  <Link
                    key={article.title}
                    href={localePath(locale, `/fotografie/${cat.slug}`)}
                    className="group flex gap-4 p-4 bg-cream border border-ink-200 rounded-xl hover:border-signal/40 transition-colors"
                  >
                    <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                      <ProtectedImage
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-ink-400 mb-1">{formatDate(article.date)}</p>
                      <h3 className="font-medium text-ink group-hover:text-signal transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-ink-500 mt-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
