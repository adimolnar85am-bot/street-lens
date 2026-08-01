import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

const ADMIN_COOKIE = "sl_admin_session";

async function hmacHex(secret: string, value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyToken(
  token: string | undefined,
  secret: string,
  password: string
) {
  if (!token || !secret || !password) return false;
  try {
    const expected = await hmacHex(secret, `admin:${password}`);
    if (token.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < token.length; i++) {
      diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

function getPreferredLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang?.toLowerCase().includes("en")) return "en";
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const secret =
      process.env.ADMIN_SECRET?.trim() ||
      process.env.ADMIN_PASSWORD?.trim() ||
      "";
    const password = process.env.ADMIN_PASSWORD?.trim() || "";
    const ok = await verifyToken(token, secret, password);

    if (!ok) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
      }
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (isLocale(maybeLocale)) {
    return NextResponse.next();
  }

  const locale = getPreferredLocale(request);
  const newPath =
    pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(new URL(newPath, request.url));
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
