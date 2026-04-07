import { NextResponse } from "next/server";
import { getClientIdentifier } from "@/lib/getClientIdentifier";
import { getRedisContext, canPass } from "@/lib/redisContext";
import formatWaitTime from "@/lib/formatWaitTime";
import {
  commentsListKey,
  MAX_COMMENT_AUTHOR_LEN,
  MAX_COMMENT_TEXT_LEN,
  MAX_COMMENTS_STORED_PER_POST,
  parseStoredComments,
  validatePostRelativePath,
} from "@/lib/postEngagement";

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
      return NextResponse.json({ comments: [], configured: false });
    }

    const key = commentsListKey(relativePath);
    const raw = await ctx.redis.lrange(key, 0, MAX_COMMENTS_STORED_PER_POST - 1);
    const comments = parseStoredComments(raw);
    return NextResponse.json({ comments, configured: true });
  } catch (e) {
    console.error("post-engagement comments GET:", e);
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

    const author = String(body?.author ?? "")
      .trim()
      .slice(0, MAX_COMMENT_AUTHOR_LEN);
    const text = String(body?.text ?? "")
      .trim()
      .slice(0, MAX_COMMENT_TEXT_LEN);
    if (!author) {
      return NextResponse.json({ error: "Author is required" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    const ctx = getRedisContext();
    if (!ctx) {
      return NextResponse.json({ comments: [], configured: false });
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      author,
      text,
      createdAt: Date.now(),
    };

    const key = commentsListKey(relativePath);
    const payload = JSON.stringify(entry);
    await ctx.redis.lpush(key, payload);
    await ctx.redis.ltrim(key, 0, MAX_COMMENTS_STORED_PER_POST - 1);

    const raw = await ctx.redis.lrange(key, 0, MAX_COMMENTS_STORED_PER_POST - 1);
    const comments = parseStoredComments(raw);
    return NextResponse.json({ comments, configured: true });
  } catch (e) {
    console.error("post-engagement comments POST:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
