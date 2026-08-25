import { ImageResponse } from "next/og";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { defaultOgPhoto, siteUrl } from "@/lib/site";

export const runtime = "edge";
export const alt = "alt:frame";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : "ro";
  const dict = await getDictionary(locale);
  const photoUrl = `${siteUrl}${defaultOgPhoto}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          backgroundColor: "#111111",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(100%) contrast(1.08) brightness(0.72)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.45) 45%, rgba(17,17,17,0.1) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "56px 64px",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#F2EFE8",
            }}
          >
            <span>alt</span>
            <span style={{ color: "#FF2400" }}>:</span>
            <span>frame</span>
          </div>
          <div
            style={{
              fontSize: 28,
              fontStyle: "normal",
              color: "#FF2400",
              letterSpacing: "0",
            }}
          >
            {dict.brand.tagline}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#F2EFE8",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              maxWidth: 900,
              textTransform: "uppercase",
            }}
          >
            {dict.meta.ogHeadline}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(242,239,232,0.75)",
              maxWidth: 780,
              lineHeight: 1.35,
            }}
          >
            {dict.meta.ogTagline}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
