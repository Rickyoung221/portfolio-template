import PostList from "./post-list";
import { client } from "../../../tina/__generated__/client";

const tinaFetch = { fetchOptions: { cache: "no-store" } };

export default async function PostsIndexPage() {
  const pages = await client.queries.postConnection({}, tinaFetch);
  return <PostList {...pages} />;
}
