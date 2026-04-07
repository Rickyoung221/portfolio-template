import Post from "./client-page";
import PostEngagement from "@/components/post-engagement/PostEngagement";
import client from "../../../../tina/__generated__/client";
import PageContainer from "@/components/layout/PageContainer";
import { relativePathFromFilenameParam } from "@/lib/blog-path";
import { notFound } from "next/navigation";

const tinaFetch = { fetchOptions: { cache: "no-store" } };

/** Avoid `generateStaticParams` calling Tina during `next build` (no GraphQL server). */
export const dynamic = "force-dynamic";

export default async function PostPage({ params }) {
  const relativePath = relativePathFromFilenameParam(params.filename);
  if (!relativePath) {
    notFound();
  }

  const data = await client.queries.post({ relativePath }, tinaFetch);
  if (!data?.data?.post) {
    notFound();
  }

  return (
    <PageContainer>
      <Post {...data} />
      <div className="container mx-auto px-4 max-w-3xl pb-8 text-text-light dark:text-text-dark">
        <PostEngagement relativePath={relativePath} />
      </div>
    </PageContainer>
  );
}
