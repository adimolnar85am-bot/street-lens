import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";

const EVENT_ID = "2026-10-03";
const PREFIX = `theme-locks/${EVENT_ID}/`;
const MAX_THEMES = 24;

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

async function getLockedThemes(): Promise<string[]> {
  if (!blobEnabled()) return [];

  const page = await list({ prefix: PREFIX, limit: MAX_THEMES });
  return page.blobs
    .map((blob) => blob.pathname.replace(PREFIX, "").replace(/\.json$/i, ""))
    .filter(Boolean);
}

export async function GET() {
  if (!blobEnabled()) {
    return NextResponse.json(
      { enabled: false, locked: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const locked = await getLockedThemes();
    return NextResponse.json(
      { enabled: true, locked },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Theme locks read failed:", error);
    return NextResponse.json(
      { enabled: false, locked: [], error: "storage_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  if (!blobEnabled()) {
    return NextResponse.json(
      { enabled: false, error: "storage_unavailable" },
      { status: 503 }
    );
  }

  let body: { themeId?: string };
  try {
    body = (await request.json()) as { themeId?: string };
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const themeId = body.themeId?.trim();
  if (!themeId || !/^AF-\d{2}$/.test(themeId)) {
    return NextResponse.json({ error: "invalid_theme" }, { status: 400 });
  }

  const pathname = `${PREFIX}${themeId}.json`;

  try {
    await put(
      pathname,
      JSON.stringify({
        themeId,
        event: EVENT_ID,
        takenAt: new Date().toISOString(),
      }),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
      }
    );

    return NextResponse.json({ enabled: true, taken: true, themeId });
  } catch {
    try {
      const locked = await getLockedThemes();
      if (locked.includes(themeId)) {
        return NextResponse.json(
          { enabled: true, taken: false, themeId, error: "already_taken" },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Theme lock conflict check failed:", error);
    }

    return NextResponse.json(
      { enabled: false, error: "storage_unavailable" },
      { status: 503 }
    );
  }
}
