/**
 * Blog post URLs and Tina `relativePath` helpers.
 *
 * Path segments are joined with `/` without `encodeURIComponent`. Tina Admin reads
 * `ui.router()` paths into the URL hash; percent-encoded CJK (e.g. %E5%AD%A6…) is
 * passed through to GraphQL as literal folder names and breaks `relativePath`
 * (repo files use Unicode: `学习文档/agent_note.md`). Next.js still accepts IRI
 * paths and decodes `%…` in the request URL when present.
 */

/**
 * If a segment is still percent-encoded (e.g. copy-paste or old links), decode once.
 * Invalid `%` sequences are left unchanged.
 * @param {string} seg
 * @returns {string}
 */
function normalizePathSegment(seg) {
  const s = String(seg);
  if (!s.includes("%")) return s;
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * @param {string[]} segments — Tina `_sys.breadcrumbs`
 * @returns {string} path without leading slash
 */
export function joinPostsPathSegments(segments) {
  if (!Array.isArray(segments) || segments.length === 0) return "";
  return segments.map((s) => String(s)).join("/");
}

/**
 * @param {{ breadcrumbs?: string[]; filename?: string } | null | undefined} sys
 * @returns {string}
 */
export function postHrefFromSys(sys) {
  if (!sys) return "/posts";
  const bc = sys.breadcrumbs;
  if (Array.isArray(bc) && bc.length > 0) {
    return `/posts/${joinPostsPathSegments(bc)}`;
  }
  const name = sys.filename ?? "";
  return name ? `/posts/${String(name)}` : "/posts";
}

/**
 * @param {string | string[] | undefined} filename — Next `[...filename]` param (decoded)
 * @returns {string | null} Tina collection relativePath, e.g. `folder/My File.md`
 */
export function relativePathFromFilenameParam(filename) {
  /** @type {string[]} */
  let segments;
  if (Array.isArray(filename)) {
    segments = filename.map(String);
  } else if (filename != null && filename !== "") {
    const s = String(filename);
    segments = s.includes("/") ? s.split("/").filter(Boolean) : [s];
  } else {
    return null;
  }

  segments = segments.map(normalizePathSegment);

  if (segments.length === 0) return null;
  if (segments.some((seg) => seg.trim() === "")) return null;
  if (segments.some((seg) => seg === "." || seg === "..")) return null;

  let normalized = segments.map((seg) => seg.replace(/\\/g, "/")).join("/");
  normalized = normalized.replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized) return null;
  if (normalized.split("/").some((p) => p === "." || p === "..")) return null;

  return normalized.endsWith(".md") ? normalized : `${normalized}.md`;
}

/**
 * Parent folder label for grouping list UI (Tina `relativePath`).
 * @param {string} [relativePath]
 * @returns {string}
 */
export function folderKeyFromRelativePath(relativePath) {
  if (!relativePath) return "";
  const normalized = String(relativePath).replace(/\\/g, "/");
  const withoutExt = normalized.replace(/\.md$/i, "");
  const i = withoutExt.lastIndexOf("/");
  return i === -1 ? "" : withoutExt.slice(0, i);
}
