import { headers } from "next/headers";

/**
 * Best-effort client id for rate limits / per-visitor keys (IP from edge headers).
 * @returns {string}
 */
export function getClientIdentifier() {
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
