import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import { getBlogArticles } from "@/lib/data-server";
import { getBlogPageContent } from "@/lib/content-server";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const blog = getBlogPageContent(locale);
  const articles = getBlogArticles(dict, locale);

  return (
    <div>
      <div className="bg-ink-900 border-b border-ink-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-400 hover:text-cream text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-signal/80" />
            <h1 className="font-display text-4xl lg:text-6xl text-cream">
              {blog.pageTitle}
            </h1>
          </div>
          <p className="text-ink-300 max-w-2xl leading-relaxed">{blog.pageBody}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={localePath(locale, `/fotografie/${article.categorySlug}`)}
              className="group"
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
                <ProtectedImage
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-xs text-signal/70 uppercase tracking-wider mb-2">
                {article.category}
              </p>
              <h2 className="font-display text-xl text-cream group-hover:text-signal transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-ink-400 mt-2 line-clamp-2">{article.excerpt}</p>
              {article.body ? (
                <p className="text-sm text-ink-500 mt-2 line-clamp-3">{article.body}</p>
              ) : null}
              <p className="text-xs text-ink-500 mt-3">{formatDate(article.date)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
