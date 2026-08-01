"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/photos", label: "Poze", icon: Camera },
  { href: "/admin/content", label: "Conținut", icon: FileText },
];

export function AdminNav({
  title,
  subtitle,
  onLogout,
}: {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-ink/95 backdrop-blur border-b border-ink-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-signal/80 font-semibold tracking-widest uppercase">
              Admin Street Lens
            </p>
            <h1 className="font-display text-2xl">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-ink-400 mt-1">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-2 text-sm text-ink-300 hover:text-cream"
            >
              Site
            </Link>
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-ink-700 rounded-sm hover:border-ink-500"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : null}
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 text-sm rounded-sm border transition-colors",
                  active
                    ? "border-signal/50 bg-signal/10 text-cream"
                    : "border-ink-800 text-ink-400 hover:text-cream hover:border-ink-600"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-ink-400 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 bg-ink-900 border border-ink-700 rounded-sm text-sm text-cream focus:outline-none focus:border-signal";

export function AdminField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <Field label={label}>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </Field>
  );
}

export function LocaleTabs({
  locale,
  onChange,
}: {
  locale: "ro" | "en";
  onChange: (l: "ro" | "en") => void;
}) {
  return (
    <div className="flex gap-2 mb-6">
      {(["ro", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-sm border transition-colors",
            locale === l
              ? "border-signal bg-signal/15 text-cream"
              : "border-ink-700 text-ink-400 hover:border-ink-500"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function SaveBar({
  saving,
  saved,
  error,
  onSave,
}: {
  saving: boolean;
  saved: boolean;
  error: string | null;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-0 mt-8 py-4 border-t border-ink-800 bg-ink/95 backdrop-blur flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2.5 bg-signal hover:bg-signal-light disabled:opacity-50 text-ink font-bold rounded-sm text-sm"
      >
        {saving ? "Se salvează..." : "Salvează secțiunea"}
      </button>
      {saved ? <span className="text-sm text-green-400">Salvat ✓</span> : null}
      {error ? <span className="text-sm text-red-400">{error}</span> : null}
    </div>
  );
}
