import Link from "next/link";
import { Camera, FileText, Heart, Newspaper, ShoppingBag, Trophy } from "lucide-react";
import { AdminNav } from "@/components/AdminShell";

const cards = [
  {
    href: "/admin/photos",
    title: "Poze site",
    body: "Încarcă fotografii noi, exclude, restaurează sau șterge din galerie.",
    icon: Camera,
  },
  {
    href: "/admin/content?tab=newsletter",
    title: "Newsletter",
    body: "Text footer, subiect email, adresă contact.",
    icon: Newspaper,
  },
  {
    href: "/admin/content?tab=blog",
    title: "Blog & articole",
    body: "Pagina blog, titluri, excerpt-uri și conținut articole.",
    icon: FileText,
  },
  {
    href: "/admin/content?tab=contest",
    title: "Concurs & regulament",
    body: "Tema activă, deadline, premii și regulile oficiale.",
    icon: Trophy,
  },
  {
    href: "/admin/content?tab=hero",
    title: "Hero & Despre",
    body: "Text homepage, CTAs și secțiunea Despre noi.",
    icon: FileText,
  },
  {
    href: "/admin/content?tab=photowalks",
    title: "Photowalk-uri",
    body: "Titluri, teme, format întâlnire și descrieri walk-uri.",
    icon: Camera,
  },
  {
    href: "/admin/content?tab=termeni",
    title: "Termeni & confidențialitate",
    body: "Pagini legale — termeni, politică de confidențialitate.",
    icon: FileText,
  },
  {
    href: "/admin/content?tab=membership",
    title: "Membership",
    body: "Planuri, prețuri, beneficii și text homepage.",
    icon: Heart,
  },
  {
    href: "/admin/content?tab=shop",
    title: "Magazin",
    body: "Produse merch, prețuri, text pagini magazin și print.",
    icon: ShoppingBag,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen">
      <AdminNav title="Dashboard" subtitle="Gestionează conținutul și pozele site-ului" />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ href, title, body, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="p-6 bg-ink-900 border border-ink-800 rounded-xl hover:border-signal/40 transition-colors group"
            >
              <Icon className="w-8 h-8 text-signal/70 mb-4 group-hover:text-signal" />
              <h2 className="font-display text-xl text-cream mb-2">{title}</h2>
              <p className="text-sm text-ink-400 leading-relaxed">{body}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
