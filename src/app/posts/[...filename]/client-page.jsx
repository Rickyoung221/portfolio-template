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
    ({
      type: "root",
      children: [{ type: "p", children: [{ type: "text", text: "" }] }],
    });

  return (
    <article className="container mx-auto px-4 max-w-3xl space-y-6 text-text-light dark:text-text-dark">
      <h1
        className="text-3xl font-semibold"
        data-tina-field={tinaField(post, "title")}
      >
        {post.title}
      </h1>
      <div
        className="leading-relaxed [&_a]:text-solarized-blue dark:[&_a]:text-solarized-accentGh [&_ul]:list-disc [&_ul]:pl-6"
        data-tina-field={tinaField(post, "body")}
      >
        <TinaMarkdown content={content} />
      </div>
    </article>
  );
}
