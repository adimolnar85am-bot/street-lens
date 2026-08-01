import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Street Lens",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-cream">
      {children}
    </div>
  );
}
