import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let cached;

/**
 * Trim and strip accidental surrounding quotes from .env values.
 * Lines like UPSTASH_REDIS_REST_URL="https://..." must not leave `"` in the value.
 */
function normalizeUpstashEnv(value) {
  if (value == null) return "";
  let s = String(value).trim();
  if (s.length >= 2) {
    const q = s[0];
    if ((q === '"' || q === "'") && s[s.length - 1] === q) {
      s = s.slice(1, -1).trim();
    }
  }
  return s;
}

/** @returns {{ redis: import("@upstash/redis").Redis, read: Ratelimit, write: Ratelimit } | null} */
export function getRedisContext() {
  if (cached !== undefined) return cached;
  const url = normalizeUpstashEnv(process.env.UPSTASH_REDIS_REST_URL);
  const token = normalizeUpstashEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !token) {
    cached = null;
    return null;
  }
  const redis = new Redis({ url, token });
  const read = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(50, "1 m"),
  });
  const write = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, "1 m"),
  });
  cached = { redis, read, write };
  return cached;
}

export async function canPass(kind, identifier) {
  const ctx = getRedisContext();
  if (!ctx) return { success: true, reset: Date.now() };
  const limiter = kind === "write" ? ctx.write : ctx.read;
  const result = await limiter.limit(`${kind}:${identifier}`);
  return { success: result.success, reset: result.reset };
}
