import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import type { SiteContent } from "@/lib/content.types";

type MembershipContent = SiteContent["membership"]["ro"];

export function MembershipCTA({
  locale,
  membership,
}: {
  locale: Locale;
  membership: MembershipContent;
}) {
  return (
    <section className="py-20 lg:py-28 bg-warm section-accent relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="w-16 h-16 bg-signal/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-signal" />
        </div>
        <h2 className="font-display text-3xl lg:text-5xl text-ink leading-tight mb-6">
          {membership.sectionTitle}
        </h2>
        <p className="text-ink-500 leading-relaxed mb-8 max-w-2xl mx-auto">
          {membership.sectionBody}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
          {membership.homepageCards.map((tier) => (
            <div
              key={tier.price}
              className="p-5 bg-cream rounded-lg border border-ink-200 text-left"
            >
              <p className="font-display text-xl text-ink">{tier.price}</p>
              <p className="text-ink-400 text-xs mt-2 leading-relaxed">{tier.features}</p>
            </div>
          ))}
        </div>

        <Link
          href={localePath(locale, "/membership")}
          className="inline-flex items-center gap-2 px-8 py-4 bg-ink hover:bg-ink-800 text-cream font-medium rounded-sm transition-colors"
        >
          {membership.learnMore}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
