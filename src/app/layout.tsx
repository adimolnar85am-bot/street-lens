import { Urbanist } from "next/font/google";
import { CopyrightProtection } from "@/components/CopyrightProtection";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={urbanist.variable} suppressHydrationWarning>
      <body className={`${urbanist.className} bg-ink text-cream antialiased`}>
        <CopyrightProtection />
        {children}
      </body>
    </html>
  );
}
