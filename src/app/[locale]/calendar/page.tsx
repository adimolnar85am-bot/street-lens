import Link from "next/link";
import { ArrowLeft, Calendar, Coffee, Trophy } from "lucide-react";
import { getPhotowalks, getActiveContest } from "@/lib/data-server";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const walks = getPhotowalks(dict, locale);
  const contest = getActiveContest(dict, locale);
  const nextWalk = walks[0];

  return (
    <div>
      <div className="bg-warm border-b border-ink-200 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-500 hover:text-ink text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-signal" />
            <h1 className="font-display text-4xl lg:text-5xl text-ink">
              {dict.calendar.pageTitle}
            </h1>
          </div>
          <p className="text-ink-500 leading-relaxed">{dict.calendar.pageBody}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section>
          <h2 className="font-display text-2xl text-ink mb-6">{dict.calendar.upcoming}</h2>
          <div className="space-y-4">
            <div className="p-6 bg-cream border border-ink-200 rounded-xl">
              <p className="text-xs text-signal font-semibold uppercase tracking-wider mb-2">
                {dict.calendar.nextWalk} · {dict.calendar.everySaturday}
              </p>
              <h3 className="font-display text-xl text-ink mb-2">{nextWalk.title}</h3>
              <p className="text-sm text-ink-500 flex items-center gap-2 mb-4">
                <Coffee className="w-4 h-4" />
                {dict.photowalks.meetupFormat}
              </p>
              <Link
                href={localePath(locale, `/photowalks/${nextWalk.id}`)}
                className="text-sm font-medium text-signal hover:text-signal-light transition-colors"
              >
                {dict.calendar.addToCalendar} →
              </Link>
            </div>

            <div className="p-6 bg-ink rounded-xl">
              <p className="text-xs text-signal/70 font-semibold uppercase tracking-wider mb-2">
                {dict.calendar.contestDeadline}
              </p>
              <h3 className="font-display text-xl text-cream mb-2">{contest.title}</h3>
              <p className="text-sm text-ink-400 flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4" />
                {dict.contest.deadline}: {formatDate(contest.deadline)}
              </p>
              <Link
                href={localePath(locale, "/concursuri")}
                className="text-sm font-medium text-signal hover:text-signal-light transition-colors"
              >
                {dict.contest.joinNow} →
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-6">{dict.calendar.past}</h2>
          <div className="space-y-3">
            {walks.map((walk) => (
              <Link
                key={walk.id}
                href={localePath(locale, `/photowalks/${walk.id}`)}
                className="flex items-center justify-between p-4 bg-cream border border-ink-200 rounded-lg hover:border-signal/40 transition-colors"
              >
                <div>
                  <p className="font-medium text-ink">{walk.title}</p>
                  <p className="text-sm text-ink-500">{walk.theme}</p>
                </div>
                <span className="text-sm text-ink-400">{formatDate(walk.date)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
