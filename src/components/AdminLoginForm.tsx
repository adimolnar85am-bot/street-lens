"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera } from "lucide-react";

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-leica flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl">Admin</h1>
            <p className="text-xs text-ink-400">Acces restricționat</p>
          </div>
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
      </form>
    </div>
  );
}
