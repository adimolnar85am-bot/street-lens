import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import {
  assignMerchPhotoToItem,
  deleteMerchPhotoPermanently,
  getCachedMerchAssignments,
  getMerchProductCatalog,
  hydrateMerchStorage,
  listAllMerchPhotosNewestFirst,
  uploadMerchPhotoFromBuffer,
  writeMerchAssignments,
} from "@/lib/merch-photos-server";

export const runtime = "nodejs";
export const maxDuration = 60;

function revalidateMerchPaths() {
  const paths = ["/", "/magazin", "/magazin/print", "/admin/merch"];
  for (const locale of ["ro", "en"]) {
    for (const p of paths) {
      revalidatePath(`/${locale}${p === "/" ? "" : p}`);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/merch");
}

async function handleUpload(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  await hydrateMerchStorage();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Payload prea mare sau invalid. Max ~4 MB per poză." },
      { status: 413 }
    );
  }

  const entries = formData.getAll("files");
  const files = entries.filter((entry): entry is File => entry instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "Niciun fișier selectat" }, { status: 400 });
  }

  if (files.length > 20) {
    return NextResponse.json({ error: "Maxim 20 de poze odată" }, { status: 400 });
  }

  const uploaded: { id: string; src: string; name: string }[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadMerchPhotoFromBuffer(
        buffer,
        file.type || "image/jpeg"
      );
      uploaded.push({ ...result, name: file.name });
    } catch (err) {
      errors.push({
        name: file.name,
        error: err instanceof Error ? err.message : "Eroare la upload",
      });
    }
  }

  if (!uploaded.length && errors.length) {
    return NextResponse.json(
      { error: errors[0]?.error || "Upload eșuat", errors },
      { status: 400 }
    );
  }

  revalidateMerchPaths();

  return NextResponse.json({
    ok: true,
    uploaded,
    errors,
    photos: listAllMerchPhotosNewestFirst(),
    assignments: getCachedMerchAssignments(),
    products: getMerchProductCatalog(),
  });
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  await hydrateMerchStorage();
  return NextResponse.json({
    photos: listAllMerchPhotosNewestFirst(),
    assignments: getCachedMerchAssignments(),
    products: getMerchProductCatalog(),
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      return await handleUpload(request);
    } catch (err) {
      console.error("admin merch photos upload:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Eroare neașteptată la upload",
        },
        { status: 500 }
      );
    }
  }

  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  await hydrateMerchStorage();

  let body: {
    action?: string;
    id?: string;
    ids?: string[];
    itemId?: string;
    photoId?: string | null;
    assignments?: { items?: Record<string, { photoId: string; src: string }> };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }

  if (body.action === "assign" && body.itemId) {
    try {
      const assignments = await assignMerchPhotoToItem(
        body.itemId,
        body.photoId ?? null
      );
      revalidateMerchPaths();
      return NextResponse.json({
        ok: true,
        assignments,
        photos: listAllMerchPhotosNewestFirst(),
        products: getMerchProductCatalog(),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Eroare la asignare" },
        { status: 400 }
      );
    }
  }

  if (body.assignments?.items) {
    await writeMerchAssignments({ items: body.assignments.items });
    revalidateMerchPaths();
    return NextResponse.json({
      ok: true,
      assignments: getCachedMerchAssignments(),
    });
  }

  const action = String(body.action || "delete");
  const ids = Array.isArray(body.ids)
    ? body.ids.map(String).filter(Boolean)
    : body.id
      ? [String(body.id)]
      : [];

  if (!ids.length) {
    return NextResponse.json({ error: "ID lipsă" }, { status: 400 });
  }

  const results: { id: string; ok: boolean }[] = [];
  for (const id of ids) {
    const ok = await deleteMerchPhotoPermanently(id);
    results.push({ id, ok });
  }

  const succeeded = results.filter((r) => r.ok).length;
  if (!succeeded) {
    return NextResponse.json({ error: "Nicio poză nu a fost găsită" }, { status: 404 });
  }

  revalidateMerchPaths();

  return NextResponse.json({
    ok: true,
    processed: succeeded,
    photos: listAllMerchPhotosNewestFirst(),
    assignments: getCachedMerchAssignments(),
    products: getMerchProductCatalog(),
  });
}

export async function PUT(request: Request) {
  try {
    return await handleUpload(request);
  } catch (err) {
    console.error("admin merch photos upload:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Eroare neașteptată la upload",
      },
      { status: 500 }
    );
  }
}
