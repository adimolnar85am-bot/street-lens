import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowLeft, Trophy, Upload } from "lucide-react";
import { getActiveContest } from "@/lib/data-server";
import { formatDate } from "@/lib/utils";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConcursuriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const activeContest = getActiveContest(dict);

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
            <Trophy className="w-8 h-8 text-signal/80" />
            <h1 className="font-display text-4xl lg:text-6xl text-cream">
              {dict.contest.pageTitle}
            </h1>
          </div>
          <p className="text-ink-300 max-w-2xl leading-relaxed">
            {dict.contest.pageBody}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
            <ProtectedImage
              src={activeContest.image}
              alt={activeContest.title}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-signal/15 text-signal text-xs font-medium rounded-sm mb-4">
              {dict.contest.active}
            </span>
            <h2 className="font-display text-3xl lg:text-4xl text-cream mb-4">
              {activeContest.title}
            </h2>
            <p className="text-ink-300 leading-relaxed mb-8">{activeContest.theme}</p>

            <dl className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-ink-800">
                <dt className="text-ink-400 text-sm">{dict.contest.deadline}</dt>
                <dd className="text-cream text-sm font-medium">
                  {formatDate(activeContest.deadline)}
                </dd>
              </div>
              <div className="flex justify-between py-3 border-b border-ink-800">
                <dt className="text-ink-400 text-sm">{dict.contest.received}</dt>
                <dd className="text-cream text-sm font-medium">
                  {activeContest.submissions}
                </dd>
              </div>
              <div className="flex justify-between py-3 border-b border-ink-800">
                <dt className="text-ink-400 text-sm">{dict.contest.prize}</dt>
                <dd className="text-cream text-sm font-medium">
                  {activeContest.prize}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <a
                href={`mailto:${dict.contact.email}?subject=${encodeURIComponent(dict.contest.uploadSubject)}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-signal hover:bg-signal-light text-ink font-medium rounded-sm transition-colors justify-center"
              >
                <Upload className="w-5 h-5" />
                {dict.contest.upload}
              </a>
              <Link
                href={localePath(locale, "/concursuri/regulament")}
                className="inline-flex items-center gap-2 px-6 py-4 text-cream/70 hover:text-cream text-sm font-medium transition-colors justify-center"
              >
                {dict.contest.rulesLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
