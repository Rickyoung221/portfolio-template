import { relativePathFromFilenameParam } from "@/lib/blog-path";

export const MAX_POST_RELATIVE_PATH_LEN = 280;
export const MAX_COMMENT_AUTHOR_LEN = 60;
export const MAX_COMMENT_TEXT_LEN = 2000;
export const MAX_COMMENTS_STORED_PER_POST = 200;

/** @param {string} relativePath */
export function likeCountKey(relativePath) {
  return `site:post:like:count:${relativePath}`;
}

/** @param {string} relativePath @param {string} identifier */
export function likeVoterKey(relativePath, identifier) {
  return `site:post:like:voter:${relativePath}:${identifier}`;
}

/** @param {string} relativePath */
export function commentsListKey(relativePath) {
  return `site:post:comments:${relativePath}`;
}

/**
 * Upstash may deserialize JSON list elements into objects before they reach us.
 * @param {unknown} item
 * @returns {{ id: string, author: string, text: string, createdAt: number } | null}
 */
export function parseCommentListItem(item) {
  let o;
  if (typeof item === "string") {
    try {
      o = JSON.parse(item);
    } catch {
      return null;
    }
  } else if (item && typeof item === "object" && !Array.isArray(item)) {
    o = item;
  } else {
    return null;
  }
  const createdAt =
    typeof o.createdAt === "number"
      ? o.createdAt
      : Number(o.createdAt);
  if (
    o &&
    typeof o.id === "string" &&
    typeof o.author === "string" &&
    typeof o.text === "string" &&
    Number.isFinite(createdAt)
  ) {
    return { id: o.id, author: o.author, text: o.text, createdAt };
  }
  return null;
}

/**
 * @param {unknown} rawList
 */
export function parseStoredComments(rawList) {
  if (!Array.isArray(rawList)) return [];
  const out = [];
  for (const item of rawList) {
    const c = parseCommentListItem(item);
    if (c) out.push(c);
  }
  return out;
}

/**
 * @param {unknown} input
 * @returns {string | null} Tina post `relativePath` or null
 */
export function validatePostRelativePath(input) {
  const raw = String(input ?? "").trim();
  if (!raw || raw.length > MAX_POST_RELATIVE_PATH_LEN) return null;
  const normalized = relativePathFromFilenameParam(raw.replace(/^\/+/, ""));
  return normalized;
}
