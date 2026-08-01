import Link from "next/link";
import { ArrowLeft, Camera, Heart, Shield } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { notFound } from "next/navigation";

import { getAboutContent } from "@/lib/content-server";

export const dynamic = "force-dynamic";

export default async function DesprePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const about = getAboutContent(locale);

  const values = [
    { icon: Heart, title: dict.about.value1Title, body: dict.about.value1Body },
    { icon: Camera, title: dict.about.value2Title, body: dict.about.value2Body },
    { icon: Shield, title: dict.about.value3Title, body: dict.about.value3Body },
  ];

  return (
    <div>
      <div className="bg-ink-900 border-b border-ink-800 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 text-ink-400 hover:text-cream text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.common.home}
          </Link>
          <h1 className="font-display text-4xl lg:text-6xl text-cream mb-6">
            {dict.about.pageTitle}
          </h1>
          <p className="text-ink-300 text-lg leading-relaxed">{about.pageBody}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section>
          <h2 className="font-display text-2xl lg:text-3xl text-cream mb-4">
            {dict.about.missionTitle}
          </h2>
          <p className="text-ink-300 leading-relaxed">{about.missionBody}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl lg:text-3xl text-cream mb-4">
            {dict.about.howTitle}
          </h2>
          <p className="text-ink-300 leading-relaxed">{about.howBody}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl lg:text-3xl text-cream mb-8">
            {dict.about.valuesTitle}
          </h2>
          <div className="grid gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-6 bg-ink-900 border border-ink-800 rounded-xl"
              >
                <Icon className="w-6 h-6 text-signal/80 mb-3" />
                <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
                <p className="text-ink-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <Link
          href={localePath(locale, "/membership")}
          className="inline-flex items-center gap-2 px-8 py-4 bg-signal hover:bg-signal-light text-ink font-medium rounded-sm transition-colors"
        >
          {dict.about.joinCta}
        </Link>
      </div>
    </div>
  );
}
