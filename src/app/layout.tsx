import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import { CopyrightProtection } from "@/components/CopyrightProtection";
import { PwaRegister } from "@/components/PwaRegister";
import { siteName } from "@/lib/site";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  applicationName: "streetlens",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "streetlens",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-any.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: [{ url: "/icons/icon-192.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={urbanist.variable} suppressHydrationWarning>
      <body className={`${urbanist.className} bg-ink text-cream antialiased`}>
        <PwaRegister />
        <CopyrightProtection />
        {children}
      </body>
    </html>
  );
}
