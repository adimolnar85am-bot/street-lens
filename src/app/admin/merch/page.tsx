"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { AdminNav } from "@/components/AdminShell";
import { prepareImagesForUpload } from "@/lib/client-image-compress";
import { cn } from "@/lib/utils";

type MerchPhoto = {
  id: string;
  src: string;
  uploadedAt?: string;
};

type MerchProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
};

type MerchAssignments = {
  items: Record<string, { photoId: string; src: string }>;
};

type PickerProduct = MerchProduct | null;

function uploadOneFile(
  file: File,
  onProgress: (percent: number) => void
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/merch-photos");
    xhr.withCredentials = true;

    const formData = new FormData();
    formData.append("files", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    });

    xhr.addEventListener("load", () => {
      onProgress(100);
      let data: Record<string, unknown> = {};
      const text = xhr.responseText || "";
      if (text.trim().startsWith("{")) {
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          data = { error: "Răspuns invalid de la server" };
        }
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    });

    xhr.addEventListener("error", () => reject(new Error("Eroare de rețea")));
    xhr.send(formData);
  });
}

export default function AdminMerchPhotosPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<MerchPhoto[]>([]);
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [assignments, setAssignments] = useState<MerchAssignments>({ items: {} });
  const [pickerProduct, setPickerProduct] = useState<PickerProduct>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const assignmentByPhotoId = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [itemId, assignment] of Object.entries(assignments.items)) {
      const list = map.get(assignment.photoId) ?? [];
      list.push(itemId);
      map.set(assignment.photoId, list);
    }
    return map;
  }, [assignments.items]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/merch-photos");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    setPhotos(data.photos || []);
    setProducts(data.products || []);
    setAssignments(data.assignments || { items: {} });
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function assignPhoto(itemId: string, photoId: string | null) {
    setBusy(itemId);
    setMessage(null);
    const res = await fetch("/api/admin/merch-photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", itemId, photoId }),
    });
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Eroare la salvare");
      setBusy(null);
      return;
    }
    setAssignments(data.assignments);
    setPhotos(data.photos || photos);
    setPickerProduct(null);
    setBusy(null);
    setMessage("Salvat — imaginea apare în magazin la reîncărcare.");
    router.refresh();
  }

  async function deletePhoto(id: string) {
    const usedBy = assignmentByPhotoId.get(id);
    const warn = usedBy?.length
      ? `Imaginea e folosită la ${usedBy.length} produs(e). Ștergi oricum?`
      : "Ștergi definitiv această imagine merch?";
    if (!window.confirm(warn)) return;

    setBusy(id);
    const res = await fetch("/api/admin/merch-photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = await res.json();
      setPhotos(data.photos || []);
      setAssignments(data.assignments || { items: {} });
      router.refresh();
    }
    setBusy(null);
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const raw = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!raw.length) {
      setError("Selectează fișiere imagine (JPG, PNG, WebP).");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    setUploadLabel("Pregătire imagini…");

    let files: File[];
    try {
      files = await prepareImagesForUpload(raw);
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : "Nu s-au putut procesa imaginile");
      return;
    }

    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadLabel(`Poză ${i + 1} / ${files.length}: ${file.name}`);
        const { ok, status, data } = await uploadOneFile(file, (pct) => {
          const overall = Math.round(((i + pct / 100) / files.length) * 100);
          setUploadPercent(overall);
        });
        if (status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!ok) {
          setError(String(data.error || file.name));
          continue;
        }
        successCount += 1;
      }
      await load();
      router.refresh();
      if (successCount) {
        setMessage(
          `${successCount} ${successCount === 1 ? "imagine încărcată" : "imagini încărcate"} (doar merch)`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la upload");
    } finally {
      setUploading(false);
      setUploadPercent(0);
      setUploadLabel("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <AdminNav
        title="Imagini merch"
        subtitle="Stocare separată — nu apar în slide-uri, galerie sau alte secțiuni"
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/content?tab=shop"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-ink-700 rounded-sm hover:border-ink-500"
          >
            <ShoppingBag className="w-4 h-4" />
            Editează produse & prețuri
          </Link>
          <Link
            href="/admin/photos"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-ink-700 rounded-sm hover:border-ink-500"
          >
            Bibliotecă poze site
          </Link>
        </div>

        <section>
          <h2 className="font-display text-xl text-cream mb-4">Produse magazin</h2>
          {loading ? (
            <p className="text-ink-400 text-sm">Se încarcă…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const assigned = assignments.items[product.id];
                return (
                  <div
                    key={product.id}
                    className="p-4 bg-ink-900 border border-ink-800 rounded-lg"
                  >
                    <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">
                      {product.category} · {product.price} RON
                    </p>
                    <p className="text-sm text-cream font-medium mb-3">{product.name}</p>
                    <div className="relative w-full aspect-square rounded-md overflow-hidden bg-ink-800 mb-3">
                      {assigned ? (
                        <ProtectedImage
                          src={assigned.src}
                          fill
                          className="object-contain p-1"
                          sizes="25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-ink-500 text-xs px-4 text-center">
                          Fără imagine
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy === product.id}
                        onClick={() => setPickerProduct(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs bg-signal text-ink font-semibold rounded-sm disabled:opacity-50"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        Alege imagine
                      </button>
                      {assigned ? (
                        <button
                          type="button"
                          disabled={busy === product.id}
                          onClick={() => assignPhoto(product.id, null)}
                          className="px-3 py-2 text-xs border border-ink-700 rounded-sm hover:border-leica text-ink-300 disabled:opacity-50"
                        >
                          Șterge
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
          }}
          className={cn(
            "rounded-xl border-2 border-dashed p-6 transition-colors",
            dragOver
              ? "border-signal bg-signal/10"
              : "border-ink-700 bg-ink-900/50 hover:border-ink-500"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-cream">Încarcă imagini merch</p>
              <p className="text-sm text-ink-400 mt-1">
                Aceste imagini rămân doar în magazin — nu intră în rotația site-ului.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => e.target.files?.length && uploadFiles(e.target.files)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal hover:bg-signal-light disabled:opacity-50 text-ink font-bold rounded-sm text-sm"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Se încarcă…" : "Alege imagini"}
              </button>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-ink-700 rounded-sm hover:border-ink-500"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            </div>
          </div>
          {uploading ? (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cream/90">{uploadLabel}</span>
                <span className="text-ink-400 tabular-nums">{uploadPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
                <div
                  className="h-full bg-signal rounded-full transition-[width]"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
            </div>
          ) : null}
          {message ? <p className="mt-4 text-sm text-green-400">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-leica">{error}</p> : null}
        </div>

        <section>
          <h2 className="font-display text-xl text-cream mb-4">
            Bibliotecă merch ({photos.length})
          </h2>
          {photos.length === 0 ? (
            <p className="text-ink-400 text-sm">Nicio imagine merch încă.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => {
                const usedBy = assignmentByPhotoId.get(photo.id) ?? [];
                return (
                  <div
                    key={photo.id}
                    className="relative rounded-lg overflow-hidden border border-ink-800 bg-ink-900"
                  >
                    <div className="relative aspect-square">
                      <ProtectedImage
                        src={photo.src}
                        fill
                        className="object-contain p-1 bg-ink-800"
                        sizes="25vw"
                      />
                      {usedBy.length > 0 ? (
                        <span className="absolute top-2 left-2 text-[10px] bg-signal text-ink font-semibold px-1.5 py-0.5 rounded-sm">
                          {usedBy.length} produs{usedBy.length > 1 ? "e" : ""}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-2 flex items-center justify-between gap-2">
                      <p className="text-[10px] text-ink-400 truncate flex-1">{photo.id}</p>
                      <button
                        type="button"
                        disabled={busy === photo.id}
                        onClick={() => deletePhoto(photo.id)}
                        className="p-1.5 text-leica hover:bg-leica/10 rounded-sm disabled:opacity-50"
                        title="Șterge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {pickerProduct ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/80">
          <div className="w-full sm:max-w-4xl h-[85vh] sm:max-h-[85vh] bg-ink-900 border border-ink-700 sm:rounded-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink-800 shrink-0">
              <div>
                <p className="text-xs text-signal uppercase tracking-wider">Merch</p>
                <h3 className="font-display text-lg text-cream">{pickerProduct.name}</h3>
                <p className="text-xs text-ink-400 mt-1">Alege o imagine din biblioteca merch</p>
              </div>
              <button
                type="button"
                onClick={() => setPickerProduct(null)}
                className="p-2 text-ink-400 hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {photos.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-8">
                  Încarcă imagini merch mai sus, apoi revino aici.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      disabled={busy === pickerProduct.id}
                      onClick={() => assignPhoto(pickerProduct.id, photo.id)}
                      className={cn(
                        "rounded-lg overflow-hidden border-2 transition-colors",
                        assignments.items[pickerProduct.id]?.photoId === photo.id
                          ? "border-signal"
                          : "border-ink-700 hover:border-ink-500"
                      )}
                    >
                      <div className="relative aspect-square bg-ink-800">
                        <ProtectedImage
                          src={photo.src}
                          fill
                          className="object-contain p-1"
                          sizes="33vw"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
