import { NextResponse } from "next/server";
import { cloudinary, configureCloudinary, isCloudinaryEnabled } from "@/lib/cloudinary-config";

const EVENT_ID = "2026-10-03";
const PREFIX = `altframe/theme-locks/${EVENT_ID}/`;

function ensureCloudinary() {
  if (!isCloudinaryEnabled()) return false;
  configureCloudinary();
  return true;
}

export async function GET() {
  if (!ensureCloudinary()) {
    return NextResponse.json(
      { enabled: false, locked: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const result = (await cloudinary.api.resources({
      resource_type: "raw",
      type: "upload",
      prefix: PREFIX,
      max_results: 100,
    })) as {
      resources?: Array<{ public_id?: string }>;
    };

    const locked = (result.resources ?? [])
      .map((resource) => resource.public_id?.replace(PREFIX, ""))
      .filter((value): value is string => Boolean(value))
      .filter((value) => /^AF-\d{2}$/.test(value));

    return NextResponse.json(
      { enabled: true, locked },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Cloudinary theme locks read failed:", error);
    return NextResponse.json(
      { enabled: false, locked: [], error: "storage_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  if (!ensureCloudinary()) {
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

  const publicId = `${PREFIX}${themeId}`;
  const payload = JSON.stringify({
    themeId,
    event: EVENT_ID,
    takenAt: new Date().toISOString(),
  });

  try {
    const dataUri = `data:application/json;base64,${Buffer.from(payload).toString("base64")}`;

    await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      type: "upload",
      public_id: publicId,
      overwrite: false,
      unique_filename: false,
      invalidate: false,
    });

    return NextResponse.json({
      enabled: true,
      taken: true,
      themeId,
    });
  } catch (error) {
    const httpCode =
      typeof error === "object" &&
      error !== null &&
      "http_code" in error
        ? Number((error as { http_code?: number }).http_code)
        : undefined;

    if (httpCode === 409) {
      return NextResponse.json(
        { enabled: true, taken: false, themeId, error: "already_taken" },
        { status: 409 }
      );
    }

    console.error("Cloudinary theme lock write failed:", error);
    return NextResponse.json(
      { enabled: false, error: "storage_unavailable" },
      { status: 503 }
    );
  }
}
