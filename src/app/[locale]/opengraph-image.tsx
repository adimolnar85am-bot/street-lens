import { ImageResponse } from "next/og";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { defaultOgPhoto, siteUrl } from "@/lib/site";

export const runtime = "edge";
export const alt = "Street Lens";
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
          backgroundColor: "#171717",
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
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(23,23,23,0.95) 0%, rgba(23,23,23,0.4) 45%, rgba(23,23,23,0.15) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "56px 64px",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#e20612",
              }}
            />
            <span
              style={{
                color: "#ffb800",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {dict.brand.name}
            </span>
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#f8f4ef",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            {dict.meta.ogHeadline}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(248,244,239,0.75)",
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
