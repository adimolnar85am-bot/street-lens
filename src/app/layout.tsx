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
  applicationName: siteName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#171717",
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
