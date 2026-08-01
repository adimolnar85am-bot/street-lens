import Link from "next/link";
import { ArrowLeft, Heart, Check } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { getMembershipContent, getSiteContent } from "@/lib/content-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const membership = getMembershipContent(locale);
  const contactEmail = getSiteContent().newsletter[locale].contactEmail;

  const tiers = [
    membership.tiers.free,
    membership.tiers.community,
    membership.tiers.patron,
  ];

  return (
    <div>
      <div className="bg-warm border-b border-ink-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-500 hover:text-ink text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <div className="w-16 h-16 bg-signal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-signal" />
          </div>
          <h1 className="font-display text-4xl lg:text-6xl text-ink mb-4">
            {membership.pageTitle}
          </h1>
          <p className="text-ink-500 max-w-2xl mx-auto leading-relaxed">
            {membership.pageBody}
          </p>
        </div>
      </div>

      <div className="bg-warm min-h-screen py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${
                  tier.highlighted
                    ? "bg-ink text-cream ring-2 ring-signal/40 scale-105 shadow-2xl"
                    : "bg-cream border border-ink-200"
                }`}
              >
                <h2
                  className={`font-display text-2xl ${
                    tier.highlighted ? "text-cream" : "text-ink"
                  }`}
                >
                  {tier.name}
                </h2>
                <div className="mt-4 mb-6">
                  <span
                    className={`font-display text-4xl ${
                      tier.highlighted ? "text-cream" : "text-ink"
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm ml-2 ${
                      tier.highlighted ? "text-ink-400" : "text-ink-500"
                    }`}
                  >
                    {tier.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          tier.highlighted ? "text-signal/80" : "text-signal"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          tier.highlighted ? "text-ink-300" : "text-ink-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                {tier.mailto ? (
                  <a
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(membership.joinSubject)}&body=${encodeURIComponent(tier.name)}`}
                    className={`block w-full py-3 text-sm font-bold rounded-sm transition-colors text-center ${
                      tier.highlighted
                        ? "bg-signal hover:bg-signal-light text-ink"
                        : "bg-ink hover:bg-ink-800 text-cream"
                    }`}
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <button
                    className="w-full py-3 text-sm font-bold rounded-sm bg-ink-100 text-ink-500 cursor-default"
                    disabled
                  >
                    {tier.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
