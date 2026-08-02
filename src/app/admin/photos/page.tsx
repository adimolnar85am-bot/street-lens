"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, RotateCcw, Trash2, RefreshCw, Upload, ImagePlus, LayoutGrid, CheckSquare, Square, X } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { AdminNav } from "@/components/AdminShell";
import { prepareImagesForUpload } from "@/lib/client-image-compress";
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

function parseUploadError(status: number, responseText: string): string {
  const trimmed = responseText.trim();
  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed) as { error?: string };
      if (json.error) return json.error;
    } catch {
      /* fall through */
    }
  }
  if (status === 401) return "Sesiune expirată — reconectează-te.";
  if (status === 413) return "Poză prea mare. Max ~4 MB per fișier pe server.";
  if (status >= 500) return `Eroare server (${status}). Încearcă o poză mai mică.`;
  if (status === 0) return "Conexiune întreruptă.";
  return `Upload eșuat (cod ${status}).`;
}

function uploadOneFile(
  file: File,
  onProgress: (percent: number) => void
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/photos");
    xhr.withCredentials = true;

    const formData = new FormData();
    formData.append("files", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.min(percent, 99));
    });

    xhr.addEventListener("load", () => {
      onProgress(100);
      let data: Record<string, unknown> = {};
      const text = xhr.responseText || "";
      if (text.trim().startsWith("{")) {
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          data = { error: parseUploadError(xhr.status, text) };
        }
      } else {
        data = { error: parseUploadError(xhr.status, text) };
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

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

  function toggleSelectionMode() {
    setSelectionMode((on) => {
      if (on) setSelectedIds(new Set());
      return !on;
    });
    setBulkMessage(null);
  }

  function togglePhotoSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds(new Set(filtered.map((p) => p.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function bulkAct(action: "exclude" | "restore" | "delete") {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === "delete") {
      const ok = window.confirm(
        `Ștergi definitiv ${ids.length} ${ids.length === 1 ? "poză" : "poze"}? Acțiunea nu poate fi anulată.`
      );
      if (!ok) return;
    }

    setBulkBusy(true);
    setBulkMessage(null);
    const res = await fetch("/api/admin/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });

    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }

    const data = await res.json();
    if (res.ok) {
      setPhotos(data.photos || []);
      setSelectedIds(new Set());
      setBulkMessage(
        action === "exclude"
          ? `${data.processed} ${data.processed === 1 ? "poză eliminată" : "poze eliminate"} de pe site`
          : action === "restore"
            ? `${data.processed} ${data.processed === 1 ? "poză restaurată" : "poze restaurate"}`
            : `${data.processed} ${data.processed === 1 ? "poză ștearsă" : "poze șterse"} definitiv`
      );
      router.refresh();
    } else {
      setBulkMessage(data.error || "Eroare la acțiunea în masă");
    }
    setBulkBusy(false);
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const raw = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!raw.length) {
      setUploadError("Selectează fișiere imagine (JPG, PNG, WebP).");
      return;
    }

    setUploading(true);
    setUploadMessage(null);
    setUploadError(null);
    setUploadProgress({
      percent: 0,
      phase: "processing",
      fileCount: raw.length,
      label: "Pregătire imagini (redimensionare, JPG)…",
    });

    let files: File[];
    try {
      files = await prepareImagesForUpload(raw);
    } catch (err) {
      setUploading(false);
      setUploadProgress(null);
      setUploadError(
        err instanceof Error ? err.message : "Nu s-au putut procesa imaginile"
      );
      return;
    }

    const tooLarge = files.find((f) => f.size > 4 * 1024 * 1024);
    if (tooLarge) {
      setUploading(false);
      setUploadProgress(null);
      setUploadError(
        `„${tooLarge.name}" e încă prea mare după compresie. Încearcă o poză mai mică.`
      );
      return;
    }

    setUploadMessage(null);
    setUploadError(null);

    let successCount = 0;
    const failMessages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({
          percent: Math.round((i / files.length) * 100),
          phase: "uploading",
          fileCount: files.length,
          label: `Poză ${i + 1} / ${files.length}: ${file.name}`,
        });

        const { ok, status, data } = await uploadOneFile(file, (filePercent) => {
          const overall = Math.round(((i + filePercent / 100) / files.length) * 100);
          setUploadProgress({
            percent: Math.min(overall, 99),
            phase: filePercent >= 99 ? "processing" : "uploading",
            fileCount: files.length,
            label:
              filePercent >= 99
                ? `Procesare poză ${i + 1} / ${files.length}…`
                : `Poză ${i + 1} / ${files.length}: ${file.name}`,
          });
        });

        if (status === 401) {
          router.replace("/admin/login");
          return;
        }

        if (!ok) {
          failMessages.push(String(data.error || file.name));
          continue;
        }

        successCount += 1;
      }

      setUploadProgress({
        percent: 100,
        phase: "processing",
        fileCount: files.length,
        label: "Actualizare galerie…",
      });

      await load();
      router.refresh();

      if (successCount && failMessages.length) {
        setUploadMessage(
          `${successCount} poze încărcate · ${failMessages.length} eșuate`
        );
      } else if (successCount) {
        setUploadMessage(
          `${successCount} ${successCount === 1 ? "poză încărcată" : "poze încărcate"}`
        );
      } else {
        setUploadError(failMessages[0] || "Nicio poză nu a fost încărcată");
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

  const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));
  const selectedVisible = selectedPhotos.filter((p) => !p.excluded).length;
  const selectedHidden = selectedPhotos.filter((p) => p.excluded).length;

  return (
    <div className="min-h-screen">
      <AdminNav
        title="Poze site"
        subtitle={`${visible} vizibile · ${hidden} eliminate · ${photos.length} total`}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 pb-4 space-y-4">
        <Link
          href="/admin/photos/assignments"
          className="flex items-center gap-3 p-4 bg-ink-900 border border-ink-800 rounded-xl hover:border-signal/40 transition-colors"
        >
          <LayoutGrid className="w-5 h-5 text-signal shrink-0" />
          <div>
            <p className="text-sm font-medium text-cream">Poze pe secțiuni</p>
            <p className="text-xs text-ink-400">
              Alege ce poze rulează în Hero, galerie, concurs, photowalk-uri și articole
            </p>
          </div>
        </Link>

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
                  Trage poze aici — JPG, PNG, WebP. Se redimensionează automat
                  (max 2400px) și se salvează ca JPG optimizat.
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
          <button
            type="button"
            onClick={toggleSelectionMode}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-sm transition-colors",
              selectionMode
                ? "bg-signal text-ink border-signal font-semibold"
                : "border-ink-700 hover:border-ink-500"
            )}
          >
            {selectionMode ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectionMode ? "Mod selectare activ" : "Selectare multiplă"}
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
        {selectionMode ? (
          <p className="text-xs text-ink-400">
            Atinge pozele pentru a le selecta, apoi alege acțiunea din bara de jos.
          </p>
        ) : null}
        {bulkMessage ? (
          <p className="text-sm text-green-400">{bulkMessage}</p>
        ) : null}
      </div>

      <div
        className={cn(
          "max-w-7xl mx-auto px-4 py-8",
          selectionMode && selectedIds.size > 0 && "pb-36"
        )}
      >
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
            {filtered.map((photo) => {
              const isSelected = selectedIds.has(photo.id);
              return (
              <div
                key={photo.id}
                role={selectionMode ? "button" : undefined}
                tabIndex={selectionMode ? 0 : undefined}
                onClick={
                  selectionMode
                    ? () => togglePhotoSelection(photo.id)
                    : undefined
                }
                onKeyDown={
                  selectionMode
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          togglePhotoSelection(photo.id);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "relative rounded-lg overflow-hidden border bg-ink-900 transition-colors",
                  photo.excluded ? "border-ink-700 opacity-70" : "border-ink-800",
                  selectionMode && "cursor-pointer hover:border-ink-500",
                  isSelected && "border-signal ring-2 ring-signal/40"
                )}
              >
                <div className="relative aspect-square">
                  <ProtectedImage
                    src={photo.src}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="25vw"
                  />
                  {selectionMode ? (
                    <div
                      className={cn(
                        "absolute top-2 right-2 w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-signal border-signal text-ink"
                          : "bg-ink/70 border-cream/40 text-transparent"
                      )}
                    >
                      <CheckSquare className="w-4 h-4" />
                    </div>
                  ) : null}
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
                {!selectionMode ? (
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
                ) : (
                  <p className="px-2 py-2 text-[10px] text-ink-400 truncate">
                    {photo.id}
                  </p>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>

      {selectionMode && selectedIds.size > 0 ? (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="max-w-7xl mx-auto bg-ink-900 border border-ink-700 rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream">
                {selectedIds.size}{" "}
                {selectedIds.size === 1 ? "poză selectată" : "poze selectate"}
              </p>
              <p className="text-xs text-ink-400 mt-0.5">
                {selectedVisible > 0 ? `${selectedVisible} pe site` : null}
                {selectedVisible > 0 && selectedHidden > 0 ? " · " : null}
                {selectedHidden > 0 ? `${selectedHidden} eliminate` : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllFiltered}
                disabled={bulkBusy}
                className="px-3 py-2 text-xs border border-ink-700 rounded-sm hover:border-ink-500 disabled:opacity-50"
              >
                Selectează tot ({filtered.length})
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={bulkBusy}
                className="px-3 py-2 text-xs border border-ink-700 rounded-sm hover:border-ink-500 disabled:opacity-50"
              >
                Deselectează
              </button>
              {selectedVisible > 0 ? (
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => bulkAct("exclude")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-ink-800 hover:bg-ink-700 rounded-sm disabled:opacity-50"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Elimină de pe site
                </button>
              ) : null}
              {selectedHidden > 0 ? (
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => bulkAct("restore")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-signal text-ink font-semibold rounded-sm disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurează
                </button>
              ) : null}
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => bulkAct("delete")}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-leica border border-leica/30 hover:bg-leica/10 rounded-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Șterge definitiv
              </button>
              <button
                type="button"
                onClick={toggleSelectionMode}
                disabled={bulkBusy}
                className="p-2 text-ink-400 hover:text-cream disabled:opacity-50"
                title="Închide selectarea"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
