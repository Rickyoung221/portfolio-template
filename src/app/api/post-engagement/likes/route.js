import { NextResponse } from "next/server";
import { getClientIdentifier } from "@/lib/getClientIdentifier";
import { getRedisContext, canPass } from "@/lib/redisContext";
import formatWaitTime from "@/lib/formatWaitTime";
import {
  likeCountKey,
  likeVoterKey,
  validatePostRelativePath,
} from "@/lib/postEngagement";

async function readCountAndLiked(ctx, relativePath, identifier) {
  const countKey = likeCountKey(relativePath);
  const voterKey = likeVoterKey(relativePath, identifier);
  const [raw, voted] = await Promise.all([
    ctx.redis.get(countKey),
    ctx.redis.get(voterKey),
  ]);
  const count = raw == null ? 0 : Number(raw) || 0;
  return { count, liked: Boolean(voted) };
}

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const relativePath = validatePostRelativePath(
      searchParams.get("path") ?? ""
    );
    if (!relativePath) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const ctx = getRedisContext();
    if (!ctx) {
      return NextResponse.json({
        count: 0,
        liked: false,
        configured: false,
      });
    }

    const { count, liked } = await readCountAndLiked(
      ctx,
      relativePath,
      identifier
    );
    return NextResponse.json({ count, liked, configured: true });
  } catch (e) {
    console.error("post-engagement likes GET:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const relativePath = validatePostRelativePath(body?.path);
    if (!relativePath) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const action = body?.action === "unlike" ? "unlike" : "like";

    const ctx = getRedisContext();
    if (!ctx) {
      return NextResponse.json({
        count: 0,
        liked: false,
        configured: false,
      });
    }

    const countKey = likeCountKey(relativePath);
    const voterKey = likeVoterKey(relativePath, identifier);

    if (action === "like") {
      const added = await ctx.redis.set(voterKey, "1", { nx: true });
      if (added) {
        await ctx.redis.incr(countKey);
      }
    } else {
      const removed = await ctx.redis.del(voterKey);
      if (removed > 0) {
        const n = await ctx.redis.decr(countKey);
        if (n < 0) {
          await ctx.redis.set(countKey, "0");
        }
      }
    }

    const { count, liked } = await readCountAndLiked(
      ctx,
      relativePath,
      identifier
    );
    return NextResponse.json({ count, liked, configured: true });
  } catch (e) {
    console.error("post-engagement likes POST:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
