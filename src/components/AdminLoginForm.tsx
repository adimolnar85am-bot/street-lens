"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Autentificare eșuată");
        setLoading(false);
        return;
      }
      const next = search.get("next") || "/admin/photos";
      router.replace(next);
      router.refresh();
    } catch {
      setError("Eroare de rețea");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-ink-900 border border-ink-700 rounded-xl p-8"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo variant="stacked" height={88} animate />
          <h1 className="font-display text-2xl mt-4">Admin</h1>
          <p className="text-xs text-ink-400">Acces restricționat</p>
        </div>

        <label className="block text-sm text-ink-300 mb-2">Parolă</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-ink border border-ink-700 rounded-sm text-cream focus:outline-none focus:border-signal mb-4"
          autoFocus
          required
        />

        {error && <p className="text-sm text-leica mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-signal hover:bg-signal-light text-ink font-bold rounded-sm transition-colors disabled:opacity-60"
        >
          {loading ? "Se verifică…" : "Intră"}
        </button>

        <p className="mt-6 text-[11px] text-ink-500 leading-relaxed text-center">
          Pentru shortcut pe telefon/desktop: deschide{" "}
          <strong className="text-ink-400">/admin/login</strong>, apoi
          „Adaugă pe ecranul principal”. Iconița trebuie să se numească{" "}
          <strong className="text-ink-400">Admin</strong> — șterge shortcut-ul
          vechi „streetlens” dacă există.
        </p>
      </form>
    </div>
  );
}
