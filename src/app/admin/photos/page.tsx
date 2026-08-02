"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, RotateCcw, Trash2, RefreshCw, Upload, ImagePlus } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { AdminNav } from "@/components/AdminShell";
import { cn } from "@/lib/utils";

type AdminPhoto = {
  id: string;
  src: string;
  excluded: boolean;
  orientation?: "landscape" | "portrait" | "square";
};

type UploadProgress = {
  percent: number;
  phase: "uploading" | "processing";
  fileCount: number;
  label: string;
};

function uploadWithProgress(
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "/api/admin/photos");

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.min(percent, 99));
    });

    xhr.addEventListener("load", () => {
      onProgress(100);
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        data = { error: "Răspuns invalid de la server" };
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    });

    xhr.addEventListener("error", () => reject(new Error("Eroare de rețea la upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload anulat")));

    xhr.send(formData);
  });
}

export default function AdminPhotosPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      setUploadError("Selectează fișiere imagine (JPG, PNG, WebP).");
      return;
    }

    setUploading(true);
    setUploadMessage(null);
    setUploadError(null);
    setUploadProgress({
      percent: 0,
      phase: "uploading",
      fileCount: files.length,
      label: `Se trimit ${files.length} ${files.length === 1 ? "fișier" : "fișiere"}…`,
    });

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const { ok, data } = await uploadWithProgress(formData, (percent) => {
        setUploadProgress((prev) =>
          prev
            ? {
                ...prev,
                percent,
                phase: percent >= 99 ? "processing" : "uploading",
                label:
                  percent >= 99
                    ? "Se procesează pozele pe server…"
                    : `Se trimit ${files.length} ${files.length === 1 ? "fișier" : "fișiere"}…`,
              }
            : null
        );
      });

      if (!ok) {
        setUploadError(String(data.error || "Upload eșuat"));
        return;
      }

      setPhotos((data.photos as AdminPhoto[]) || []);
      router.refresh();

      const uploaded = data.uploaded as { name: string }[] | undefined;
      const errors = data.errors as { name: string }[] | undefined;
      const count = uploaded?.length || 0;
      const failed = errors?.length || 0;
      if (count && failed) {
        setUploadMessage(`${count} poze încărcate · ${failed} eșuate`);
      } else if (count) {
        setUploadMessage(`${count} ${count === 1 ? "poză încărcată" : "poze încărcate"}`);
      } else {
        setUploadError("Nicio poză nu a fost încărcată");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Eroare de rețea la upload");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      uploadFiles(e.target.files);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
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
      <AdminNav
        title="Poze site"
        subtitle={`${visible} vizibile · ${hidden} eliminate · ${photos.length} total`}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 pb-4 space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "rounded-xl border-2 border-dashed p-6 sm:p-8 transition-colors",
            dragOver
              ? "border-signal bg-signal/10"
              : "border-ink-700 bg-ink-900/50 hover:border-ink-500"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-ink-800 text-signal shrink-0">
                <ImagePlus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-cream">Încarcă poze noi</p>
                <p className="text-sm text-ink-400 mt-1">
                  Trage fișiere aici sau alege din calculator. JPG, PNG, WebP — max
                  15 MB / poză, până la 20 odată.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onFileInputChange}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal hover:bg-signal-light disabled:opacity-50 text-ink font-bold rounded-sm text-sm"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Se încarcă…" : "Alege poze"}
              </button>
            </div>
          </div>
          {uploadProgress ? (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-cream/90">{uploadProgress.label}</span>
                <span className="text-ink-400 tabular-nums shrink-0">
                  {uploadProgress.percent}%
                </span>
              </div>
              <div
                className="h-2 rounded-full bg-ink-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={uploadProgress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progres upload"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-200 ease-out",
                    uploadProgress.phase === "processing"
                      ? "bg-signal/70 animate-pulse"
                      : "bg-signal"
                  )}
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
              <p className="text-xs text-ink-500">
                {uploadProgress.phase === "processing"
                  ? "Conversie JPG și actualizare galerie…"
                  : `${uploadProgress.fileCount} ${uploadProgress.fileCount === 1 ? "poză" : "poze"} selectate`}
              </p>
            </div>
          ) : null}
          {uploadMessage ? (
            <p className="mt-4 text-sm text-green-400">{uploadMessage}</p>
          ) : null}
          {uploadError ? (
            <p className="mt-4 text-sm text-leica">{uploadError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-ink-700 rounded-sm hover:border-ink-500"
          >
            <RefreshCw className="w-4 h-4" />
            Reîncarcă
          </button>
          <div className="flex gap-2">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-ink-400 text-sm">Se încarcă…</p>
        ) : filtered.length === 0 ? (
          <p className="text-ink-400 text-sm">
            {filter === "all"
              ? "Nicio poză încă. Încarcă prima fotografie mai sus."
              : "Nicio poză în acest filtru."}
          </p>
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
