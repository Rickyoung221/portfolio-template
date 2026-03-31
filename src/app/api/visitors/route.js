import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getRedisContext, canPass } from "@/lib/redisContext";
import formatWaitTime from "@/lib/formatWaitTime";
import { VISITORS_COUNT_KEY, VISITOR_IP_PREFIX } from "@/lib/visitorsConstants";

function getClientIdentifier() {
  const headersList = headers();
  const cfConnectingIp = headersList.get("cf-connecting-ip");
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  return (
    cfConnectingIp ||
    forwardedFor?.split(",")[0]?.trim() ||
    realIp ||
    "anonymous"
  );
}

export async function GET() {
  try {
    const identifier = getClientIdentifier();
    const { success, reset } = await canPass("read", identifier);
    if (!success) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${formatWaitTime(reset)}.`,
        },
        { status: 429 }
      );
    }

    const ctx = getRedisContext();
    if (!ctx) {
      return NextResponse.json({ count: 0, configured: false });
    }

    const raw = await ctx.redis.get(VISITORS_COUNT_KEY);
    const count = raw == null ? 0 : Number(raw) || 0;
    return NextResponse.json({ count, configured: true });
  } catch (e) {
    console.error("visitors GET:", e);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function POST() {
  try {
    const identifier = getClientIdentifier();
    const { success, reset } = await canPass("write", identifier);
    if (!success) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${formatWaitTime(reset)}.`,
        },
        { status: 429 }
      );
    }

    const ctx = getRedisContext();
    if (!ctx) {
      return NextResponse.json({ success: true, configured: false });
    }

    const ipKey = `${VISITOR_IP_PREFIX}${identifier}`;
    const isNewVisitor = await ctx.redis.set(ipKey, "1", {
      ex: 3600,
      nx: true,
    });

    if (isNewVisitor) {
      await ctx.redis.incr(VISITORS_COUNT_KEY);
    }

    return NextResponse.json({ success: true, configured: true });
  } catch (e) {
    console.error("visitors POST:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
