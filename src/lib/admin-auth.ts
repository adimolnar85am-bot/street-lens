import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sl_admin_session";

function getSecret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function createAdminToken(): string {
  const secret = getSecret();
  const password = getPassword();
  if (!secret || !password) {
    throw new Error("ADMIN_PASSWORD / ADMIN_SECRET lipsesc din .env.local");
  }
  return createHmac("sha256", secret).update(`admin:${password}`).digest("hex");
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const expected = createAdminToken();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const expected = getPassword();
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // still do a compare to reduce timing signal on length — hash both
    try {
      const ha = createHmac("sha256", getSecret()).update(password).digest();
      const hb = createHmac("sha256", getSecret()).update(expected).digest();
      return timingSafeEqual(ha, hb);
    } catch {
      return false;
    }
  }
  return timingSafeEqual(a, b);
}

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}
