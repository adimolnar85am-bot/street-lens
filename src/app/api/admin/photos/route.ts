import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import {
  deletePhotoPermanently,
  excludePhoto,
  getAdminPhotos,
  restorePhoto,
} from "@/lib/photos-server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  return NextResponse.json({ photos: getAdminPhotos() });
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body?.id || "");
  const action = String(body?.action || "");

  if (!id) {
    return NextResponse.json({ error: "ID lipsă" }, { status: 400 });
  }

  let ok = false;
  if (action === "exclude") ok = excludePhoto(id);
  else if (action === "restore") ok = restorePhoto(id);
  else if (action === "delete") ok = deletePhotoPermanently(id);
  else {
    return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
  }

  if (!ok) {
    return NextResponse.json({ error: "Poza nu a fost găsită" }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/galerie");
  revalidatePath("/admin/photos");

  return NextResponse.json({ ok: true, photos: getAdminPhotos() });
}
