import { ProtectedImage } from "@/components/ProtectedImage";
import Link from "next/link";
import { ArrowRight, Trophy, Clock, Users } from "lucide-react";
import { getActiveContest } from "@/lib/data-server";
import { formatDate } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

export function ContestSection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const activeContest = getActiveContest(dict, locale);

  return (
    <section className="py-20 lg:py-28 bg-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden order-2 lg:order-1">
            <ProtectedImage
              src={activeContest.image}
              alt={activeContest.title}
              fill
              className="object-cover object-center"
            />
            <div className="absolute top-6 left-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-signal/15 text-signal text-xs font-medium rounded-sm">
                <Trophy className="w-4 h-4" />
                {dict.contest.active}
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-scarlet text-sm font-semibold tracking-widest uppercase mb-3">
              {dict.contest.eyebrow}
            </p>
            <h2 className="font-display text-3xl lg:text-5xl text-ink leading-tight mb-6">
              {activeContest.title}
            </h2>
            <p className="text-ink-300 leading-relaxed mb-8">{activeContest.theme}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-white rounded-lg border border-line">
                <Clock className="w-5 h-5 text-scarlet mb-2" />
                <p className="text-ink text-sm font-medium">{dict.contest.deadline}</p>
                <p className="text-ink-400 text-xs mt-1">
                  {formatDate(activeContest.deadline)}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-line">
                <Users className="w-5 h-5 text-scarlet mb-2" />
                <p className="text-ink text-sm font-medium">{dict.contest.submissions}</p>
                <p className="text-ink-400 text-xs mt-1">
                  {activeContest.submissions} {dict.contest.photos}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/50 border border-line rounded-lg mb-8">
              <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">
                {dict.contest.prize}
              </p>
              <p className="text-ink font-medium">{activeContest.prize}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href={localePath(locale, "/concursuri")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-signal hover:bg-signal-light text-ink font-medium rounded-sm transition-colors"
              >
                {dict.contest.joinNow}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={localePath(locale, "/concursuri/arhiva")}
                className="inline-flex items-center gap-2 px-6 py-3 text-ink/70 hover:text-ink text-sm font-medium transition-colors"
              >
                {dict.contest.seeWinners}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
