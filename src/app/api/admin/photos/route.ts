import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import {
  deletePhotoPermanently,
  excludePhoto,
  getAdminPhotos,
  hydratePhotoStorage,
  restorePhoto,
  uploadPhotoFromBuffer,
} from "@/lib/photos-server";

export const runtime = "nodejs";
export const maxDuration = 60;

function revalidatePhotoPaths() {
  revalidatePath("/");
  revalidatePath("/ro");
  revalidatePath("/en");
  revalidatePath("/galerie");
  revalidatePath("/admin/photos");
}

async function handleUpload(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  await hydratePhotoStorage();

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
    return NextResponse.json(
      { error: "Maxim 20 de poze odată" },
      { status: 400 }
    );
  }

  const uploaded: { id: string; src: string; name: string }[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadPhotoFromBuffer(
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

  revalidatePhotoPaths();

  return NextResponse.json({
    ok: true,
    uploaded,
    errors,
    photos: getAdminPhotos(),
  });
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  await hydratePhotoStorage();
  return NextResponse.json({ photos: getAdminPhotos() });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      return await handleUpload(request);
    } catch (err) {
      console.error("admin photos upload:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Eroare neașteptată la upload",
        },
        { status: 500 }
      );
    }
  }

  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  await hydratePhotoStorage();

  let body: { id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }

  const id = String(body?.id || "");
  const action = String(body?.action || "");

  if (!id) {
    return NextResponse.json({ error: "ID lipsă" }, { status: 400 });
  }

  let ok = false;
  if (action === "exclude") ok = await excludePhoto(id);
  else if (action === "restore") ok = await restorePhoto(id);
  else if (action === "delete") ok = await deletePhotoPermanently(id);
  else {
    return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
  }

  if (!ok) {
    return NextResponse.json({ error: "Poza nu a fost găsită" }, { status: 404 });
  }

  revalidatePhotoPaths();

  return NextResponse.json({ ok: true, photos: getAdminPhotos() });
}

export async function PUT(request: Request) {
  try {
    return await handleUpload(request);
  } catch (err) {
    console.error("admin photos upload:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Eroare neașteptată la upload",
      },
      { status: 500 }
    );
  }
}
