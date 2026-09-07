export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://street-lens-theta.vercel.app";

export const siteName = "alt:frame";

export const social = {
  instagram: "https://instagram.com/altframe.ro",
  youtube: "https://youtube.com/@altframe",
  email: "hello@altframe.ro",
} as const;

/** Default OG share photo (landscape from hero set) */
export const defaultOgPhoto = "/photos/0c35c387ffc8eb89.jpg";
