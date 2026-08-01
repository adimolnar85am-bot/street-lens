"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff, RotateCcw, Trash2, LogOut, RefreshCw } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { cn } from "@/lib/utils";

type AdminPhoto = {
  id: string;
  src: string;
  excluded: boolean;
  orientation?: "landscape" | "portrait" | "square";
};

export default function AdminPhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/photos");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    setPhotos(data.photos || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "exclude" | "restore" | "delete") {
    if (action === "delete") {
      const ok = window.confirm(
        "Ștergi definitiv poza de pe disk? Acțiunea nu poate fi anulată."
      );
      if (!ok) return;
    }
    setBusyId(id);
    const res = await fetch("/api/admin/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      const data = await res.json();
      setPhotos(data.photos || []);
      router.refresh();
    }
    setBusyId(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const visible = photos.filter((p) => !p.excluded).length;
  const hidden = photos.filter((p) => p.excluded).length;

  const filtered = photos.filter((p) => {
    if (filter === "visible") return !p.excluded;
    if (filter === "hidden") return p.excluded;
    return true;
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-ink/95 backdrop-blur border-b border-ink-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-signal/80 font-semibold tracking-widest uppercase">
              Admin
            </p>
            <h1 className="font-display text-2xl">Curățare poze</h1>
            <p className="text-xs text-ink-400 mt-1">
              {visible} vizibile pe site · {hidden} eliminate · {photos.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-ink-700 rounded-sm hover:border-ink-500"
            >
              <RefreshCw className="w-4 h-4" />
              Reîncarcă
            </button>
            <Link
              href="/"
              className="px-3 py-2 text-sm text-ink-300 hover:text-cream"
            >
              Site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-ink-800 rounded-sm hover:bg-ink-700"
            >
              <LogOut className="w-4 h-4" />
              Ieșire
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-4 flex gap-2">
          {(
            [
              ["all", "Toate"],
              ["visible", "Pe site"],
              ["hidden", "Eliminate"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-colors",
                filter === id
                  ? "bg-signal text-ink border-signal font-semibold"
                  : "border-ink-700 text-ink-300 hover:border-ink-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-ink-400 text-sm">Se încarcă…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((photo) => (
              <div
                key={photo.id}
                className={cn(
                  "relative rounded-lg overflow-hidden border bg-ink-900",
                  photo.excluded ? "border-ink-700 opacity-70" : "border-ink-800"
                )}
              >
                <div className="relative aspect-square">
                  <ProtectedImage
                    src={photo.src}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="25vw"
                  />
                  {photo.excluded && (
                    <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-cream bg-ink/80 px-2 py-1 rounded-sm">
                        Eliminată
                      </span>
                    </div>
                  )}
                  {photo.orientation && (
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-ink/80 text-cream px-1.5 py-0.5 rounded-sm">
                      {photo.orientation === "landscape"
                        ? "L"
                        : photo.orientation === "portrait"
                          ? "P"
                          : "S"}
                    </span>
                  )}
                </div>
                <div className="p-2 flex flex-wrap gap-1">
                  {photo.excluded ? (
                    <button
                      type="button"
                      disabled={busyId === photo.id}
                      onClick={() => act(photo.id, "restore")}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-[11px] bg-signal text-ink font-semibold rounded-sm disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restaurează
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === photo.id}
                      onClick={() => act(photo.id, "exclude")}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-[11px] bg-ink-800 hover:bg-ink-700 rounded-sm disabled:opacity-50"
                    >
                      <EyeOff className="w-3 h-3" />
                      Elimină
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === photo.id}
                    onClick={() => act(photo.id, "delete")}
                    className="inline-flex items-center justify-center px-2 py-2 text-[11px] text-leica hover:bg-leica/10 rounded-sm disabled:opacity-50"
                    title="Șterge definitiv"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
