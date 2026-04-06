# Blog (Tina CMS)

Detailed steps, environment variables, and troubleshooting live in the guides below—this file is only an **index** so the [README](../README.md) stays short.

## Guides (source of truth)

| Topic | Read here |
| --- | --- |
| Env, dev vs production build | [Template setup → Tina CMS](TEMPLATE_SETUP.md#tina-cms-blog) |
| Full Tina setup (Cloud, tokens, commands, deploy, troubleshooting) | [`content/post/guides/tina-blog.md`](../content/post/guides/tina-blog.md) |
| Hub for all optional features (contact, music, visitors, Vercel env, …) | [`content/post/guides/setup-hub.md`](../content/post/guides/setup-hub.md) |

### Reading guides in the browser

This template’s deployed **base URL** is **[https://portfolio-template-usagi.vercel.app/](https://portfolio-template-usagi.vercel.app/)**; after you fork, point readers to your own host instead. Guides as rendered posts:

- [Tina blog setup](https://portfolio-template-usagi.vercel.app/posts/guides/tina-blog)
- [Project setup hub](https://portfolio-template-usagi.vercel.app/posts/guides/setup-hub)

When running **`npm run dev`** locally, use **`http://localhost:3000`** with the same paths (e.g. `/posts/guides/tina-blog`).

## Routes (quick reference)

| URL | Role |
| --- | --- |
| `/posts` | Index; posts grouped by subfolder under `content/post/` |
| `/posts/…` | Single post (URL mirrors file path under `content/post/`) |
| `/admin` | Tina admin UI (requires Tina env; dev runs the GraphQL sidecar with `npm run dev`) |

## Repo layout

- **`content/post/`** — Markdown posts (front matter + body).
- **`tina/`** — Tina schema and config; commit **`tina/tina-lock.json`** when the schema changes.
- **`public/uploads/`** — Media from the admin (see `tina/config.js`).
- **`src/app/posts/`** — Next.js routes for the blog.
- **`src/lib/blog-path.js`** — URL encoding for Unicode path segments.
