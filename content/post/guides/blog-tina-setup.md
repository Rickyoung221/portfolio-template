---
title: Blog (Tina CMS)
---

Markdown lives in **`content/post/`** (subfolders group on **`/posts`**). **`npm run dev`**: Tina GraphQL on **4001** + Next.js. **`npm run build`**: **`tinacms build`** then **`next build`**; **`/admin`** is built into **`public/admin/`**.

1. **[app.tina.io](https://app.tina.io)**: create a project, connect the **same GitHub repo** you deploy from.
2. Copy **Client ID** and create a **Token** for CLI/CI.
3. **`.env.local`** (no quotes):

```bash
NEXT_PUBLIC_TINA_CLIENT_ID=your-uuid
TINA_TOKEN=your_token
# NEXT_PUBLIC_TINA_BRANCH=main
```

| Variable | Browser? | Use |
|----------|----------|-----|
| `NEXT_PUBLIC_TINA_CLIENT_ID` | Yes | Admin + Cloud |
| `TINA_TOKEN` | No | `tinacms build` |
| `NEXT_PUBLIC_TINA_BRANCH` | Yes | Optional default branch |

Optional: **`tina/tina.local.json`** from **`tina/tina.local.example.json`** for `clientId` only; **`scripts/load-tina-env.cjs`** merges env files. Keep **`TINA_TOKEN`** in **`.env.local`** or CI.

**Deploy:** Vercel project **Settings > Environment Variables**. **GitHub Actions:** repo **Settings > Secrets and variables > Actions** for the same keys.

Commit **`tina/tina-lock.json`** after schema changes. Unicode paths: **`src/lib/blog-path.js`**.

**Fix:** Port **9000** busy: stop other **`tinacms dev`**. Admin broken: set Client ID, restart dev. Build fails: add **`TINA_TOKEN`**.

Docs: [tina.io/docs](https://tina.io/docs). [Setup hub](/posts/guides/complete-project-configuration)
