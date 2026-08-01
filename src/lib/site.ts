export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://street-lens-theta.vercel.app";

export const siteName = "Street Lens";

export const social = {
  instagram: "https://instagram.com/streetlens.ro",
  youtube: "https://youtube.com/@streetlens",
  email: "hello@streetlens.ro",
} as const;

/** Default OG share photo (landscape from hero set) */
export const defaultOgPhoto = "/photos/0c35c387ffc8eb89.jpg";
