"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MdChatBubbleOutline,
  MdFavorite,
  MdFavoriteBorder,
} from "react-icons/md";

const shellClass =
  "mt-12 border-t border-solarized-base01/25 pt-8 dark:border-solarized-base01/35";

const panelClass =
  "rounded-2xl border border-solarized-base1/30 bg-solarized-base3/50 shadow-sm transition-colors duration-300 dark:border-solarized-base01/30 dark:bg-solarized-base02/30";

const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-solarized-base00 dark:text-solarized-base0";

const mutedClass =
  "text-[12px] leading-snug text-solarized-base01/90 dark:text-solarized-base1/85";

const inputClass =
  "w-full rounded-xl border border-solarized-base1/45 bg-solarized-base3/90 px-3.5 py-2.5 text-sm text-solarized-base03 transition-[box-shadow,border-color] placeholder:text-solarized-base01/65 focus:border-solarized-blue/55 focus:outline-none focus:ring-2 focus:ring-solarized-blue/25 dark:border-solarized-base01/45 dark:bg-solarized-base03/70 dark:text-solarized-base1 dark:placeholder:text-solarized-base1/45 dark:focus:border-solarized-accentGh/50 dark:focus:ring-solarized-accentGh/20";

const btnLikeClass =
  "inline-flex min-h-[40px] min-w-[3.5rem] items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold tabular-nums transition-[transform,background-color,box-shadow] " +
  "border-solarized-base1/50 bg-solarized-base2/50 text-solarized-base02 hover:bg-solarized-base2 hover:shadow-sm active:scale-[0.98] " +
  "dark:border-solarized-base01/50 dark:bg-solarized-base03/50 dark:text-solarized-base2 dark:hover:bg-solarized-base03/70 " +
  "disabled:pointer-events-none disabled:opacity-45";

const btnPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-[opacity,transform] " +
  "bg-solarized-blue text-white hover:opacity-95 active:scale-[0.99] dark:bg-solarized-accentGh dark:text-solarized-base03 " +
  "disabled:pointer-events-none disabled:opacity-45";

const warnBoxClass =
  "rounded-xl border border-solarized-orange/35 bg-solarized-orange/10 px-3.5 py-3 text-sm text-solarized-base02 dark:border-solarized-yellow/30 dark:bg-solarized-yellow/10 dark:text-solarized-base2";

/**
 * @param {{ relativePath: string }} props
 */
export default function PostEngagement({ relativePath }) {
  /** `null` until first API response; `false` when Upstash env is missing. */
  const [redisConfigured, setRedisConfigured] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(true);
  const [likeBusy, setLikeBusy] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentBusy, setCommentBusy] = useState(false);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [formError, setFormError] = useState("");

  const pathQ = encodeURIComponent(relativePath);

  const refreshLikes = useCallback(async () => {
    const res = await fetch(`/api/post-engagement/likes?path=${pathQ}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    setRedisConfigured(data.configured === true);
    setLikesCount(Number(data.count) || 0);
    setLiked(Boolean(data.liked));
  }, [pathQ]);

  const refreshComments = useCallback(async () => {
    const res = await fetch(`/api/post-engagement/comments?path=${pathQ}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    if (data.configured === false) setRedisConfigured(false);
    else if (data.configured === true) setRedisConfigured(true);
    setComments(Array.isArray(data.comments) ? data.comments : []);
  }, [pathQ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLikesLoading(true);
      setCommentsLoading(true);
      try {
        await Promise.all([refreshLikes(), refreshComments()]);
      } finally {
        if (!cancelled) {
          setLikesLoading(false);
          setCommentsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshLikes, refreshComments]);

  async function toggleLike() {
    if (redisConfigured !== true || likeBusy) return;
    setLikeBusy(true);
    try {
      const res = await fetch("/api/post-engagement/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: relativePath,
          action: liked ? "unlike" : "like",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      if (data.configured === false) setRedisConfigured(false);
      setLikesCount(Number(data.count) || 0);
      setLiked(Boolean(data.liked));
    } finally {
      setLikeBusy(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    setFormError("");
    if (redisConfigured !== true) return;
    const a = author.trim();
    const t = text.trim();
    if (!a) {
      setFormError("Please enter a name.");
      return;
    }
    if (!t) {
      setFormError("Please write a comment.");
      return;
    }
    setCommentBusy(true);
    try {
      const res = await fetch("/api/post-engagement/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: relativePath, author: a, text: t }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Could not post comment.");
        return;
      }
      if (data.configured === false) setRedisConfigured(false);
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setText("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Network error. Try again."
      );
    } finally {
      setCommentBusy(false);
    }
  }

  const likeLabel = likesLoading ? "…" : String(likesCount);
  const textLen = text.length;

  return (
    <section className={shellClass} aria-label="Reactions and comments">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <h2 className="m-0 text-lg font-semibold tracking-tight text-solarized-base02 dark:text-solarized-base2">
          Discussion
        </h2>
        <p className={`m-0 ${mutedClass}`}>Likes and comments on this post.</p>
      </div>

      <div className={`${panelClass} p-4 sm:p-6`}>
        {redisConfigured === false && (
          <p className={`m-0 mb-6 ${warnBoxClass}`}>
            Reactions need Redis: set{" "}
            <code className="rounded-md bg-solarized-base2/60 px-1.5 py-0.5 font-mono text-[11px] dark:bg-solarized-base02/60">
              UPSTASH_REDIS_REST_URL
            </code>{" "}
            and{" "}
            <code className="rounded-md bg-solarized-base2/60 px-1.5 py-0.5 font-mono text-[11px] dark:bg-solarized-base02/60">
              UPSTASH_REDIS_REST_TOKEN
            </code>{" "}
            (same as the visitor counter).
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={sectionLabelClass}>Like</span>
            <button
              type="button"
              onClick={() => void toggleLike()}
              disabled={redisConfigured !== true || likeBusy || likesLoading}
              className={btnLikeClass}
              aria-pressed={liked}
            >
              {liked ? (
                <MdFavorite
                  className="h-[1.15rem] w-[1.15rem] shrink-0 text-solarized-red dark:text-solarized-magenta"
                  aria-hidden
                />
              ) : (
                <MdFavoriteBorder
                  className="h-[1.15rem] w-[1.15rem] shrink-0 opacity-90"
                  aria-hidden
                />
              )}
              <span>{likeLabel}</span>
            </button>
          </div>
          <p className={`m-0 max-w-md sm:text-right ${mutedClass}`}>
            One like per visitor (by IP). Tap again to remove your like.
          </p>
        </div>

        <div
          className="my-6 border-t border-solarized-base01/20 dark:border-solarized-base01/25"
          role="separator"
        />

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <MdChatBubbleOutline
              className="h-5 w-5 text-solarized-blue dark:text-solarized-accentGh"
              aria-hidden
            />
            <h3 className={`m-0 ${sectionLabelClass}`}>Comments</h3>
          </div>

          <form
            onSubmit={submitComment}
            className="space-y-4 rounded-xl border border-solarized-base01/20 bg-solarized-base2/25 p-4 dark:border-solarized-base01/20 dark:bg-solarized-base03/25"
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-solarized-base01 dark:text-solarized-base1">
                Name
              </span>
              <input
                className={inputClass}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={60}
                autoComplete="nickname"
                disabled={redisConfigured !== true || commentBusy}
                placeholder="Your name"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-solarized-base01 dark:text-solarized-base1">
                Comment
              </span>
              <textarea
                className={`${inputClass} min-h-[112px] resize-y leading-relaxed`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                disabled={redisConfigured !== true || commentBusy}
                placeholder="Say something…"
              />
              <span
                className={`block text-right text-[11px] tabular-nums ${mutedClass}`}
              >
                {textLen} / 2000
              </span>
            </label>
            {formError ? (
              <p
                className="m-0 rounded-lg border border-solarized-red/30 bg-solarized-red/10 px-3 py-2 text-sm text-solarized-red dark:border-solarized-magenta/35 dark:bg-solarized-magenta/10 dark:text-solarized-magenta"
                role="alert"
              >
                {formError}
              </p>
            ) : null}
            <button
              type="submit"
              className={btnPrimaryClass}
              disabled={redisConfigured !== true || commentBusy}
            >
              {commentBusy ? "Posting…" : "Post comment"}
            </button>
          </form>

          <ul className="m-0 list-none space-y-3 p-0">
            {commentsLoading ? (
              <li
                className={`rounded-xl border border-dashed border-solarized-base01/35 px-4 py-8 text-center text-sm ${mutedClass}`}
              >
                Loading comments…
              </li>
            ) : comments.length === 0 ? (
              <li
                className={`rounded-xl border border-dashed border-solarized-base01/35 px-4 py-8 text-center text-sm ${mutedClass}`}
              >
                No comments yet — be the first.
              </li>
            ) : (
              comments.map((c) => {
                const initial = (c.author || "?").trim().slice(0, 1);
                return (
                  <li
                    key={c.id}
                    className="flex gap-3 rounded-xl border border-solarized-base01/20 bg-solarized-base3/40 px-3.5 py-3 dark:border-solarized-base01/25 dark:bg-solarized-base03/35"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-solarized-blue/15 text-sm font-semibold text-solarized-blue dark:bg-solarized-accentGh/20 dark:text-solarized-accentGh"
                      aria-hidden
                    >
                      {initial.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-semibold text-solarized-base02 dark:text-solarized-base2">
                          {c.author}
                        </span>
                        <time
                          className={`text-[11px] ${mutedClass}`}
                          dateTime={
                            Number.isFinite(c.createdAt)
                              ? new Date(c.createdAt).toISOString()
                              : undefined
                          }
                        >
                          {new Date(c.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="mt-1.5 mb-0 whitespace-pre-wrap text-sm leading-relaxed text-solarized-base03 dark:text-solarized-base1">
                        {c.text}
                      </p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
