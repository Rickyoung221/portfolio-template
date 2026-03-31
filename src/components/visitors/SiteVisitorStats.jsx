"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  EyeIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import {
  SITE_LAUNCH_DATE,
  VISITOR_COUNT_DISPLAY_OFFSET,
} from "@/data/siteMeta";
import { getSiteAgeParts } from "@/lib/siteAge";
import { getFeaturedProjectCount } from "@/lib/featuredProjectCount";

const labelClass =
  "mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] leading-snug text-solarized-base00 dark:text-solarized-base0";

const valueClass =
  "m-0 font-semibold tabular-nums tracking-tight text-solarized-base02 dark:text-solarized-base2 text-2xl leading-none sm:text-[1.65rem]";

const captionClass =
  "m-0 text-[11px] font-medium leading-snug text-solarized-base01/90 dark:text-solarized-base1/85";

/** Smaller text after the large stat number (e.g. “days”, “unique visits”). */
const statSuffixClass =
  "text-sm sm:text-[0.95rem] font-semibold leading-none text-solarized-base01/85 dark:text-solarized-base1/80";

const iconWrapClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-[0_1px_2px_rgba(0,43,54,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:group-hover:scale-[1.03] motion-safe:group-hover:shadow-md";

const cellClass =
  "group relative flex gap-3 sm:gap-4 bg-solarized-base3/95 p-4 sm:p-5 dark:bg-solarized-base03/95 motion-safe:transition-colors motion-safe:duration-200 motion-safe:hover:bg-solarized-base2/35 dark:motion-safe:hover:bg-solarized-base02/40";

/** One-line note under Total Visitors count (first column). */
const VISITOR_COUNT_HINT =
  "Same IP at most once per hour—not every refresh.";

const statMotion = (reduceMotion, delay = 0) => ({
  initial: reduceMotion ? false : { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: reduceMotion ? 0 : 0.32,
    delay: reduceMotion ? 0 : delay,
    ease: [0.22, 1, 0.36, 1],
  },
});

const visitorHintClassName =
  "m-0 mt-1 text-[10px] leading-tight text-solarized-base01/75 dark:text-solarized-base1/60";

function StatRowSpacer() {
  return (
    <p
      className={`${captionClass} opacity-0 pointer-events-none select-none`}
      aria-hidden
    >
      &nbsp;
    </p>
  );
}

export default function SiteVisitorStats() {
  const reduceMotion = useReducedMotion();
  const [visitorStatus, setVisitorStatus] = useState("loading");
  const [count, setCount] = useState(0);

  const projectCount = useMemo(() => getFeaturedProjectCount(), []);
  const ageParts = useMemo(() => getSiteAgeParts(SITE_LAUNCH_DATE), []);
  const launchDisplay = useMemo(
    () =>
      new Date(`${SITE_LAUNCH_DATE}T12:00:00`).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    setVisitorStatus("loading");

    fetch("/api/visitors", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.configured === false) {
          setVisitorStatus("unconfigured");
          return;
        }
        const n = data?.count;
        const value = typeof n === "number" ? n : Number(n);
        if (Number.isNaN(value)) {
          setVisitorStatus("error");
          return;
        }
        setCount(value);
        setVisitorStatus("success");
      })
      .catch(() => {
        if (!cancelled) setVisitorStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalVisits =
    visitorStatus === "success" ? count + VISITOR_COUNT_DISPLAY_OFFSET : null;

  const visitsNumberDisplay =
    visitorStatus === "success" && totalVisits != null
      ? totalVisits.toLocaleString("en-US")
      : visitorStatus === "loading"
        ? null
        : "—";

  const uniqueVisitsCaption =
    visitorStatus === "success"
      ? `unique visit${totalVisits === 1 ? "" : "s"}`
      : null;

  return (
    <section
      className="w-full max-w-5xl mx-auto pb-2 pt-0"
      aria-label="Visitors, projects completed, and site age"
    >
      <div
        className="
          w-full rounded-2xl border border-solarized-base1/25 dark:border-solarized-base01/25
          bg-gradient-to-br from-white/80 via-solarized-base3/95 to-solarized-base2/85
          dark:from-solarized-base03/95 dark:via-solarized-base03/88 dark:to-solarized-base02/55
          shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_10px_36px_-10px_rgba(0,43,54,0.14)]
          dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_14px_44px_-14px_rgba(0,0,0,0.5)]
          backdrop-blur-sm backdrop-saturate-150
          p-1 sm:p-1.5
          motion-safe:transition-[box-shadow,border-color] motion-safe:duration-300
          motion-safe:hover:border-solarized-base01/40 dark:motion-safe:hover:border-solarized-base01/50
          motion-safe:hover:shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_14px_40px_-10px_rgba(0,43,54,0.2)]
          dark:motion-safe:hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_18px_52px_-14px_rgba(0,0,0,0.55)]
        "
      >
        {visitorStatus === "unconfigured" && (
          <p className="px-4 py-2 text-center text-[11px] text-solarized-base01 dark:text-solarized-base1">
            Visitor counts are off until you set{" "}
            <code className="rounded bg-solarized-base2/80 px-1 dark:bg-solarized-base02/60">
              UPSTASH_REDIS_REST_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-solarized-base2/80 px-1 dark:bg-solarized-base02/60">
              UPSTASH_REDIS_REST_TOKEN
            </code>{" "}
            (see <code className="rounded px-1">.env.example</code>).
          </p>
        )}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[0.625rem] bg-solarized-base1/15 dark:bg-solarized-base01/20 md:grid-cols-3">
          <article
            className={cellClass}
            aria-live="polite"
            aria-busy={visitorStatus === "loading"}
          >
            <div
              className={`${iconWrapClass} bg-gradient-to-br from-solarized-blue/20 to-solarized-cyan/15 text-solarized-blue ring-1 ring-solarized-blue/25 dark:from-solarized-blue/28 dark:to-solarized-cyan/22 dark:text-solarized-cyan dark:ring-solarized-cyan/30`}
              aria-hidden
            >
              <EyeIcon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              <p className={labelClass}>
                Total
                <br />
                Visitors
              </p>
              <div className="flex min-h-[3.25rem] flex-col justify-end gap-1">
                {visitorStatus === "loading" ? (
                  <>
                    <div
                      className="h-8 w-[11rem] max-w-full rounded-md bg-solarized-base1/18 dark:bg-solarized-base01/28 motion-safe:animate-pulse"
                      aria-hidden
                    />
                    <p className={visitorHintClassName}>{VISITOR_COUNT_HINT}</p>
                  </>
                ) : (
                  <>
                    <motion.p
                      className="m-0 flex flex-wrap items-baseline gap-x-1.5"
                      {...statMotion(reduceMotion, 0)}
                    >
                      <span className={valueClass}>{visitsNumberDisplay}</span>
                      {uniqueVisitsCaption ? (
                        <span className={statSuffixClass}>
                          {uniqueVisitsCaption}
                        </span>
                      ) : null}
                    </motion.p>
                    {visitorStatus === "unconfigured" ? (
                      <StatRowSpacer />
                    ) : (
                      <p className={visitorHintClassName}>{VISITOR_COUNT_HINT}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </article>

          <article className={cellClass}>
            <div
              className={`${iconWrapClass} bg-gradient-to-br from-solarized-green/22 to-solarized-cyan/12 text-solarized-green ring-1 ring-solarized-green/28 dark:from-solarized-green/28 dark:to-solarized-cyan/18 dark:text-solarized-green dark:ring-solarized-green/35`}
              aria-hidden
            >
              <CheckBadgeIcon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              <p className={labelClass}>
                Project
                <br />
                completed
              </p>
              <div className="flex min-h-[3.25rem] flex-col justify-end gap-1">
                <motion.p
                  className={valueClass}
                  {...statMotion(reduceMotion, 0.05)}
                >
                  {projectCount.toLocaleString("en-US")}
                </motion.p>
                <StatRowSpacer />
              </div>
            </div>
          </article>

          <article className={cellClass}>
            <div
              className={`${iconWrapClass} bg-gradient-to-br from-solarized-violet/22 to-solarized-magenta/12 text-solarized-violet ring-1 ring-solarized-violet/25 dark:from-solarized-violet/30 dark:to-solarized-magenta/18 dark:text-solarized-magenta dark:ring-solarized-magenta/25`}
              aria-hidden
            >
              <CalendarDaysIcon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              <p className={labelClass}>
                Portfolio
                <br />
                created
              </p>
              <div className="flex min-h-[3.25rem] flex-col justify-end gap-1">
                <p className="m-0 text-[11px] font-medium leading-snug text-solarized-base01/90 dark:text-solarized-base1/85">
                  on{" "}
                  <time dateTime={SITE_LAUNCH_DATE}>{launchDisplay}</time>
                </p>
                <motion.p
                  className="m-0 flex flex-wrap items-baseline gap-x-1.5"
                  {...statMotion(reduceMotion, 0.1)}
                >
                  <time
                    dateTime={SITE_LAUNCH_DATE}
                    className="inline-flex items-baseline gap-x-1.5"
                  >
                    {ageParts ? (
                      <>
                        <span className={valueClass}>{ageParts.value}</span>
                        <span className={statSuffixClass}>{ageParts.unit}</span>
                      </>
                    ) : (
                      <span className={valueClass}>—</span>
                    )}
                  </time>
                </motion.p>
                <StatRowSpacer />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
