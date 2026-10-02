import { NextResponse } from "next/server";

const EVENT_ID = "2026-10-03";
const REDIS_KEY = `altframe:theme-locks:${EVENT_ID}`;

function getRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "";

  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand<T = unknown>(command: string[]) {
  const config = getRedisConfig();
  if (!config) throw new Error("Redis is not configured");

  const response = await fetch(
    `${config.url}/${command.map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Redis request failed: ${response.status}`);
  }

  const data = (await response.json()) as { result?: T; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result as T;
}

export async function GET() {
  if (!getRedisConfig()) {
    return NextResponse.json(
      { enabled: false, locked: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const locked = await redisCommand<string[]>(["SMEMBERS", REDIS_KEY]);
    return NextResponse.json(
      { enabled: true, locked: locked ?? [] },
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
  if (!getRedisConfig()) {
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

  try {
    const added = await redisCommand<number>(["SADD", REDIS_KEY, themeId]);

    if (added === 1) {
      return NextResponse.json({
        enabled: true,
        taken: true,
        themeId,
      });
    }

    return NextResponse.json(
      {
        enabled: true,
        taken: false,
        themeId,
        error: "already_taken",
      },
      { status: 409 }
    );
  } catch (error) {
    console.error("Theme lock write failed:", error);
    return NextResponse.json(
      { enabled: false, error: "storage_unavailable" },
      { status: 503 }
    );
  }
}
