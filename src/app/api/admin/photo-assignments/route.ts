import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import {
  applySlotAssignment,
  buildPhotoSlotCatalog,
  getPhotoAssignments,
  writePhotoAssignments,
} from "@/lib/photo-assignments-server";
import { getAdminPhotos, getPhotoSrcById, hydratePhotoStorage } from "@/lib/photos-server";
import type { PhotoAssignments } from "@/lib/photo-assignments.types";

function revalidateSitePaths() {
  const paths = [
    "/",
    "/galerie",
    "/photowalks",
    "/concursuri",
    "/magazin",
    "/magazin/print",
    "/blog",
    "/ghiduri",
    "/harta",
    "/calendar",
    "/fotografie/digital",
    "/fotografie/analog",
    "/fotografie/telefon",
    "/admin/photos/assignments",
  ];
  for (const locale of ["ro", "en"]) {
    for (const p of paths) {
      revalidatePath(`/${locale}${p === "/" ? "" : p}`);
    }
  }
  revalidatePath("/");
  revalidatePath("/admin/photos");
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  await hydratePhotoStorage(true);
  const [assignments, photos] = await Promise.all([
    getPhotoAssignments(),
    Promise.resolve(getAdminPhotos()),
  ]);
  return NextResponse.json({
    assignments,
    slots: buildPhotoSlotCatalog(),
    photos,
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  let body: { assignments?: PhotoAssignments; slot?: string; photoId?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }

  const current = await getPhotoAssignments();
  await hydratePhotoStorage(true);

  if (body.assignments?.slots) {
    let cleaned: PhotoAssignments = { slots: {}, slotSrcs: {} };
    for (const [key, value] of Object.entries(body.assignments.slots)) {
      if (!value) continue;
      const src = getPhotoSrcById(value);
      if (!src) continue;
      cleaned = applySlotAssignment(cleaned, key, value, src);
    }
    await writePhotoAssignments(cleaned);
  } else if (body.slot) {
    const src = body.photoId ? getPhotoSrcById(body.photoId) : null;
    const next = applySlotAssignment(
      current,
      body.slot,
      body.photoId ?? null,
      src
    );
    await writePhotoAssignments(next);
  } else {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  revalidateSitePaths();

  const assignments = await getPhotoAssignments();
  return NextResponse.json({ ok: true, assignments });
}
