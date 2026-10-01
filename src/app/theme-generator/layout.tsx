import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ALT:FRAME — Theme Generator",
  description: "ALT:FRAME Theme Generator",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThemeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
