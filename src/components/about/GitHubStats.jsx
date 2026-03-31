"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import {
  FaGithub,
  FaStar,
  FaUserFriends,
  FaUserPlus,
  FaFolderOpen,
} from "react-icons/fa";

const defaultUsername =
  typeof process.env.NEXT_PUBLIC_GITHUB_USERNAME === "string" &&
  process.env.NEXT_PUBLIC_GITHUB_USERNAME.trim()
    ? process.env.NEXT_PUBLIC_GITHUB_USERNAME.trim()
    : "octocat";

function formatInt(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

export default function GitHubStats({ username = defaultUsername }) {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartSrc = useMemo(() => {
    const login = data?.login || username;
    const color = isDarkMode ? "58a6ff" : "2075c7";
    return `https://ghchart.rshah.org/${color}/${encodeURIComponent(login)}`;
  }, [data?.login, username, isDarkMode]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const q = new URLSearchParams({ username: username.trim() });
    fetch(`/api/github/stats?${q}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || `Request failed (${res.status})`);
        }
        return json;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load GitHub stats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const displayName = data?.name || data?.login || username;

  return (
    <div className="w-full max-w-5xl mt-2">
      <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 theme-primary scroll-mt-24 flex items-center gap-2">
        <FaGithub className="text-2xl sm:text-[1.65rem] opacity-90" aria-hidden />
        <span>GitHub</span>
      </h3>

      <div className="rounded-xl theme-card theme-shadow theme-border border overflow-hidden">
        {loading && (
          <p className="p-6 text-sm theme-muted" role="status">
            Loading GitHub profile…
          </p>
        )}

        {!loading && error && (
          <p className="p-6 text-sm theme-accent" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 sm:items-start">
              <div className="shrink-0 flex justify-center sm:justify-start">
                <div className="relative w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden ring-2 ring-[var(--color-border)]">
                  <Image
                    src={data.avatarUrl}
                    alt={`${displayName} avatar`}
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                    unoptimized={false}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <div>
                    <p className="text-lg sm:text-xl font-semibold theme-text truncate">
                      {displayName}
                    </p>
                    <p className="text-sm theme-muted">@{data.login}</p>
                  </div>
                  <Link
                    href={data.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium theme-primary hover:underline underline-offset-4 shrink-0"
                  >
                    View on GitHub
                    <span aria-hidden>↗</span>
                  </Link>
                </div>

                {data.bio ? (
                  <p className="mt-3 text-sm theme-text leading-relaxed text-pretty">
                    {data.bio}
                  </p>
                ) : null}

                <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="rounded-lg border theme-border bg-[var(--color-bg)]/40 dark:bg-black/15 px-3 py-3 text-center sm:text-left">
                    <dt className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium theme-muted uppercase tracking-wide">
                      <FaStar className="text-[var(--color-accent)]" aria-hidden />
                      Stars
                    </dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums theme-text">
                      {formatInt(data.totalStars)}
                    </dd>
                  </div>
                  <div className="rounded-lg border theme-border bg-[var(--color-bg)]/40 dark:bg-black/15 px-3 py-3 text-center sm:text-left">
                    <dt className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium theme-muted uppercase tracking-wide">
                      <FaFolderOpen className="text-[var(--color-primary)]" aria-hidden />
                      Repos
                    </dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums theme-text">
                      {formatInt(data.publicRepos)}
                    </dd>
                  </div>
                  <div className="rounded-lg border theme-border bg-[var(--color-bg)]/40 dark:bg-black/15 px-3 py-3 text-center sm:text-left">
                    <dt className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium theme-muted uppercase tracking-wide">
                      <FaUserFriends className="text-[var(--color-secondary)]" aria-hidden />
                      Followers
                    </dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums theme-text">
                      {formatInt(data.followers)}
                    </dd>
                  </div>
                  <div className="rounded-lg border theme-border bg-[var(--color-bg)]/40 dark:bg-black/15 px-3 py-3 text-center sm:text-left">
                    <dt className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium theme-muted uppercase tracking-wide">
                      <FaUserPlus className="text-[var(--color-muted)]" aria-hidden />
                      Following
                    </dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums theme-text">
                      {formatInt(data.following)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t theme-border">
              <p className="text-sm font-semibold theme-text mb-2">
                Contribution activity
              </p>
              {typeof data.contributionsLastYear === "number" ? (
                <p className="text-sm theme-muted mb-3">
                  <span className="font-medium theme-text">
                    {formatInt(data.contributionsLastYear)}
                  </span>{" "}
                  contributions in the last year
                </p>
              ) : (
                <p className="text-xs theme-muted mb-3">
                  Set{" "}
                  <code className="px-1 py-0.5 rounded theme-border border text-[11px]">
                    GITHUB_TOKEN
                  </code>{" "}
                  in{" "}
                  <code className="px-1 py-0.5 rounded theme-border border text-[11px]">
                    .env.local
                  </code>{" "}
                  to show your yearly contribution count (optional).
                </p>
              )}

              <div className="rounded-lg overflow-hidden border theme-border bg-[var(--color-bg)]/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chartSrc}
                  alt={`${data.login} GitHub contribution graph`}
                  className="w-full h-auto max-h-[140px] sm:max-h-[160px] object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="mt-2 text-[11px] theme-muted leading-snug">
                Heatmap via{" "}
                <a
                  href="https://ghchart.rshah.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-primary underline underline-offset-2"
                >
                  ghchart.rshah.org
                </a>
                ; star total sums public repositories you own.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
