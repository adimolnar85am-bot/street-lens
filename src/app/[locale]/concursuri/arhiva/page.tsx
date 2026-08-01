import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export default async function ArhivaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);

  return (
    <div>
      <div className="bg-ink-900 border-b border-ink-800 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/concursuri")}
            className="inline-flex items-center gap-2 text-ink-400 hover:text-cream text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.backToContests}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-signal/80" />
            <h1 className="font-display text-4xl lg:text-5xl text-cream">
              {dict.contestArchive.pageTitle}
            </h1>
          </div>
          <p className="text-ink-300 leading-relaxed">{dict.contestArchive.pageBody}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-10 lg:p-14 bg-ink-900 border border-ink-800 rounded-xl text-center">
          <Trophy className="w-12 h-12 text-signal/60 mx-auto mb-6" />
          <h2 className="font-display text-2xl text-cream mb-4">
            {dict.contestArchive.emptyTitle}
          </h2>
          <p className="text-ink-400 max-w-md mx-auto mb-8 leading-relaxed">
            {dict.contestArchive.emptyBody}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={localePath(locale, "/concursuri")}
              className="px-6 py-3 bg-signal hover:bg-signal-light text-ink font-medium rounded-sm transition-colors"
            >
              {dict.contestArchive.enterNow}
            </Link>
            <Link
              href={localePath(locale, "/concursuri/regulament")}
              className="px-6 py-3 text-cream/70 hover:text-cream text-sm font-medium transition-colors"
            >
              {dict.contestArchive.viewRules}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
