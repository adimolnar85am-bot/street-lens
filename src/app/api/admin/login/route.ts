import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  createAdminToken,
  isAdminConfigured,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        {
          error:
            "Admin neconfigurat pe server. Setează ADMIN_PASSWORD și ADMIN_SECRET (Production pe Vercel).",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const password = String(body?.password || "").trim();

    if (!checkPassword(password)) {
      return NextResponse.json(
        { error: "Parolă incorrectă" },
        { status: 401 }
      );
    }

    const token = createAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }
}
