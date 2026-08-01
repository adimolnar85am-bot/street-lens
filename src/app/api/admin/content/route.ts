import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import {
  getSiteContent,
  updateContentSection,
  writeSiteContent,
} from "@/lib/content-server";
import type { ContentSectionKey, SiteContent } from "@/lib/content.types";

const SECTIONS: ContentSectionKey[] = [
  "newsletter",
  "blog",
  "hero",
  "about",
  "contest",
  "contestRules",
  "articles",
  "photowalks",
  "terms",
  "privacy",
  "membership",
  "shop",
];

function revalidateContentPaths() {
  const paths = [
    "/",
    "/blog",
    "/despre",
    "/concursuri",
    "/concursuri/regulament",
    "/photowalks",
    "/ghiduri",
    "/fotografie/digital",
    "/fotografie/analog",
    "/fotografie/telefon",
    "/termeni",
    "/confidentialitate",
    "/membership",
    "/magazin",
    "/magazin/print",
    "/admin/content",
  ];
  for (const locale of ["ro", "en"]) {
    for (const p of paths) {
      revalidatePath(`/${locale}${p === "/" ? "" : p}`);
    }
  }
  revalidatePath("/");
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  return NextResponse.json({ content: getSiteContent() });
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const section = body?.section as ContentSectionKey | undefined;
  const data = body?.data;
  const full = body?.content as SiteContent | undefined;

  if (full) {
    writeSiteContent(full);
    revalidateContentPaths();
    return NextResponse.json({ ok: true, content: getSiteContent() });
  }

  if (!section || !SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Secțiune invalidă" }, { status: 400 });
  }

  if (data === undefined) {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }

  const content = updateContentSection(section, data);
  revalidateContentPaths();
  return NextResponse.json({ ok: true, content });
}
