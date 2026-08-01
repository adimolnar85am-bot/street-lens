import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { getTermsContent } from "@/lib/content-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TermeniPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const terms = getTermsContent(locale);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <Link
        href={localePath(locale, "/")}
        className="inline-flex items-center gap-2 text-ink-400 hover:text-cream text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {dict.common.home}
      </Link>
      <h1 className="font-display text-4xl text-cream mb-2">{terms.pageTitle}</h1>
      <p className="text-ink-500 text-sm mb-10">{terms.updated}</p>
      <p className="text-ink-300 leading-relaxed mb-10">{terms.intro}</p>
      <div className="space-y-8">
        {terms.sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl text-cream mb-3">{s.title}</h2>
            <p className="text-ink-300 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
