"use client";

import { tinaField, useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
export default function Post(props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  const post = data?.post;
  if (!post) {
    return (
      <article className="container mx-auto px-4 max-w-3xl py-8 text-text-light dark:text-text-dark">
        <p className="text-solarized-base01 dark:text-solarized-base1">
          This post could not be loaded.
        </p>
      </article>
    );
  }

  const content =
    post.body ??
    ({ type: "root", children: [{ type: "p", children: [{ type: "text", text: "" }] }] });

  /** Slightly higher information density: base `prose` (not `prose-lg`), tighter line-height and block margins. */
  const proseArticle =
    "prose prose-sm sm:prose-base max-w-none leading-normal " +
    "prose-headings:scroll-mt-20 prose-headings:font-semibold " +
    "prose-headings:mt-6 prose-headings:mb-2 first:prose-headings:mt-0 " +
    "prose-h2:mt-7 prose-h3:mt-6 prose-h4:mt-5 " +
    "prose-headings:text-solarized-base02 dark:prose-headings:text-solarized-base2 " +
    "prose-p:my-2 prose-p:text-solarized-base01 dark:prose-p:text-solarized-base1 " +
    "prose-a:text-solarized-blue dark:prose-a:text-solarized-accentGh prose-a:no-underline hover:prose-a:underline " +
    "prose-strong:text-solarized-base02 dark:prose-strong:text-solarized-base2 " +
    "prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none " +
    "prose-code:bg-solarized-base2/80 dark:prose-code:bg-solarized-base02/80 " +
    "prose-code:text-solarized-magenta dark:prose-code:text-solarized-cyan " +
    "prose-pre:text-sm prose-pre:leading-snug prose-pre:my-3 " +
    "prose-pre:bg-solarized-base03 dark:prose-pre:bg-solarized-base02 prose-pre:border prose-pre:border-solarized-base01/20 dark:prose-pre:border-solarized-base01/25 " +
    "prose-blockquote:my-3 prose-blockquote:border-l-solarized-blue prose-blockquote:text-solarized-base01 dark:prose-blockquote:text-solarized-base1 " +
    "prose-img:rounded-lg prose-img:shadow-sm prose-img:my-3 " +
    "prose-hr:my-6 prose-hr:border-solarized-base01/30 dark:prose-hr:border-solarized-base01/40 " +
    "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 " +
    "prose-li:marker:text-solarized-base00 dark:prose-li:marker:text-solarized-base0";

  return (
    <article className="container mx-auto px-4 max-w-3xl space-y-5 text-text-light dark:text-text-dark pb-8">
      <h1
        className="text-2xl sm:text-3xl font-semibold tracking-tight text-solarized-base02 dark:text-solarized-base2"
        data-tina-field={tinaField(post, "title")}
      >
        {post.title}
      </h1>
      <div
        className={proseArticle}
        data-tina-field={tinaField(post, "body")}
      >
        <TinaMarkdown content={content} />
      </div>
    </article>
  );
}
