// tina/config.js
import { defineConfig } from "tinacms";

// src/lib/blog-path.js
function joinPostsPathSegments(segments) {
  if (!Array.isArray(segments) || segments.length === 0) return "";
  return segments.map((s) => String(s)).join("/");
}
function postHrefFromSys(sys) {
  if (!sys) return "/posts";
  const bc = sys.breadcrumbs;
  if (Array.isArray(bc) && bc.length > 0) {
    return `/posts/${joinPostsPathSegments(bc)}`;
  }
  const name = sys.filename ?? "";
  return name ? `/posts/${String(name)}` : "/posts";
}

// tina/collections/post.js
var post_default = {
  label: "Blog Posts",
  name: "post",
  path: "content/post",
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title"
    },
    {
      type: "rich-text",
      label: "Blog Post Body",
      name: "body",
      isBody: true
    }
  ],
  ui: {
    router: ({ document }) => postHrefFromSys(document._sys)
  }
};

// tina/config.js
var config = defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || process.env.HEAD,
  token: process.env.TINA_TOKEN,
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads"
    }
  },
  build: {
    publicFolder: "public",
    outputFolder: "admin"
  },
  schema: {
    collections: [post_default]
  }
});
var config_default = config;
export {
  config,
  config_default as default
};
