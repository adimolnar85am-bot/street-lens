"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { AdminNav } from "@/components/AdminShell";
import { cn } from "@/lib/utils";

type AdminPhoto = {
  id: string;
  src: string;
  excluded: boolean;
  orientation?: string;
};

type SlotDef = {
  key: string;
  label: string;
  section: string;
};

type Assignments = {
  slots: Record<string, string>;
};

export default function PhotoAssignmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotDef[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({ slots: {} });
  const [pickerSlot, setPickerSlot] = useState<SlotDef | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visiblePhotos = useMemo(
    () => photos.filter((p) => !p.excluded),
    [photos]
  );

  const photoById = useMemo(() => {
    const map = new Map<string, AdminPhoto>();
    for (const p of photos) map.set(p.id, p);
    return map;
  }, [photos]);

  const grouped = useMemo(() => {
    const groups = new Map<string, SlotDef[]>();
    for (const slot of slots) {
      const list = groups.get(slot.section) ?? [];
      list.push(slot);
      groups.set(slot.section, list);
    }
    return [...groups.entries()];
  }, [slots]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/photo-assignments");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    setSlots(data.slots || []);
    setPhotos(data.photos || []);
    setAssignments(data.assignments || { slots: {} });
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function assign(slotKey: string, photoId: string | null) {
    setBusy(slotKey);
    setMessage(null);
    const res = await fetch("/api/admin/photo-assignments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot: slotKey, photoId }),
    });
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Eroare la salvare");
      setBusy(null);
      return;
    }
    setAssignments(data.assignments);
    setPickerSlot(null);
    setBusy(null);
    setMessage("Salvat — poza apare pe site la reîncărcare.");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <AdminNav
        title="Poze pe secțiuni"
        subtitle="Alege ce poză rulează în Hero, galerie, concurs, photowalk-uri, magazin și articole"
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-ink-700 rounded-sm hover:border-ink-500 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Reîncarcă
          </button>
          <p className="text-sm text-ink-400">
            Slot gol = rotație automată din pozele vizibile
          </p>
        </div>

        {message ? (
          <p className="mb-6 text-sm text-green-400">{message}</p>
        ) : null}

        {loading ? (
          <p className="text-ink-400 text-sm">Se încarcă…</p>
        ) : (
          <div className="space-y-10">
            {grouped.map(([section, sectionSlots]) => (
              <section key={section}>
                <h2 className="font-display text-xl text-cream mb-4">{section}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionSlots.map((slot) => {
                    const assignedId = assignments.slots[slot.key];
                    const assigned = assignedId ? photoById.get(assignedId) : null;
                    return (
                      <div
                        key={slot.key}
                        className="p-4 bg-ink-900 border border-ink-800 rounded-lg"
                      >
                        <p className="text-sm text-cream font-medium mb-3">
                          {slot.label}
                        </p>
                        <div className="relative aspect-video rounded-md overflow-hidden bg-ink-800 mb-3">
                          {assigned ? (
                            <ProtectedImage
                              src={assigned.src}
                              fill
                              className="object-cover"
                              sizes="33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-ink-500 text-xs px-4 text-center">
                              Automat (rotație)
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy === slot.key}
                            onClick={() => setPickerSlot(slot)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs bg-signal text-ink font-semibold rounded-sm disabled:opacity-50"
                          >
                            <ImagePlus className="w-3.5 h-3.5" />
                            Alege poză
                          </button>
                          {assigned ? (
                            <button
                              type="button"
                              disabled={busy === slot.key}
                              onClick={() => assign(slot.key, null)}
                              className="px-3 py-2 text-xs border border-ink-700 rounded-sm hover:border-leica text-ink-300 disabled:opacity-50"
                            >
                              Automat
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {pickerSlot ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/80">
          <div className="w-full max-w-4xl max-h-[85vh] bg-ink-900 border border-ink-700 rounded-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink-800">
              <div>
                <p className="text-xs text-signal uppercase tracking-wider">
                  {pickerSlot.section}
                </p>
                <h3 className="font-display text-lg text-cream">{pickerSlot.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerSlot(null)}
                className="p-2 text-ink-400 hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visiblePhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  disabled={busy === pickerSlot.key}
                  onClick={() => assign(pickerSlot.key, photo.id)}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden border-2 transition-colors",
                    assignments.slots[pickerSlot.key] === photo.id
                      ? "border-signal"
                      : "border-transparent hover:border-ink-600"
                  )}
                >
                  <ProtectedImage
                    src={photo.src}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </button>
              ))}
            </div>
            {visiblePhotos.length === 0 ? (
              <p className="p-6 text-sm text-ink-400 text-center">
                Nici o poză vizibilă. Încarcă poze în secțiunea Poze.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
