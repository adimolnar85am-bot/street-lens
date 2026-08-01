import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export default async function RegulamentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);

  const sections = [
    { title: dict.contestRules.eligibilityTitle, body: dict.contestRules.eligibilityBody },
    { title: dict.contestRules.submissionTitle, body: dict.contestRules.submissionBody },
    { title: dict.contestRules.judgingTitle, body: dict.contestRules.judgingBody },
    { title: dict.contestRules.prizesTitle, body: dict.contestRules.prizesBody },
    { title: dict.contestRules.copyrightTitle, body: dict.contestRules.copyrightBody },
  ];

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
            <FileText className="w-8 h-8 text-signal/80" />
            <h1 className="font-display text-4xl lg:text-5xl text-cream">
              {dict.contestRules.pageTitle}
            </h1>
          </div>
          <p className="text-ink-300 leading-relaxed">{dict.contestRules.pageBody}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl text-cream mb-3">{section.title}</h2>
            <p className="text-ink-300 leading-relaxed">{section.body}</p>
          </section>
        ))}

        <Link
          href={localePath(locale, "/concursuri")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-signal hover:bg-signal-light text-ink font-medium rounded-sm transition-colors"
        >
          {dict.contest.joinNow}
        </Link>
      </div>
    </div>
  );
}
