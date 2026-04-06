---
title: Vercel environment variables
---

Deploy this repo on **[Vercel](https://vercel.com)** and mirror the same keys you use in **`.env.local`**. Vercel injects them at **build time** and **runtime** for serverless routes and `NEXT_PUBLIC_*` for the browser.

---

## Open the right screen

1. Sign in at **[vercel.com](https://vercel.com)**.
2. Select your **project** (the site connected to this GitHub repo).
3. Open the **Settings** tab (top of the project dashboard).
4. In the left sidebar, click **Environment Variables**.

Direct pattern: **Project** > **Settings** > **Environment Variables**.

---

## Add a variable

1. Under **Key**, enter the exact name (e.g. `TINA_TOKEN`, `NEXT_PUBLIC_TINA_CLIENT_ID`). Names are case-sensitive and must match your **`.env.local`**.
2. Under **Value**, paste the secret or value. Do not wrap values in quotes unless your provider explicitly requires them.
3. Choose which **Environments** apply:
   - **Production**: live domain.
   - **Preview**: pull-request and branch previews.
   - **Development**: `vercel dev` (if you use it).
4. Click **Save** for each variable.

Add every key your app needs (see the [setup hub](/posts/guides/setup-hub) table). Typical sets:

| Kind | Examples |
|------|----------|
| `NEXT_PUBLIC_*` | `NEXT_PUBLIC_TINA_CLIENT_ID`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_GITHUB_USERNAME`, `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` |
| Server-only | `TINA_TOKEN`, `GITHUB_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RECAPTCHA_SECRET_KEY` |

**Rule:** Anything that must stay off the client should **not** use the `NEXT_PUBLIC_` prefix.

---

## After you change variables

- **Redeploy** so new values are picked up. From the project **Deployments** tab, open the latest deployment menu and choose **Redeploy**, or push a new commit.
- Preview deployments use **Preview** env; production uses **Production** env. If a variable is missing in one environment, that build or runtime can fail only there.

---

## Import from `.env` (optional)

Vercel can **Import** a `.env` file from the UI on the Environment Variables page. Prefer adding keys manually or via **Vercel CLI** (`vercel env pull` / `vercel env add`) if you automate. Never commit **`.env.local`** to Git.

---

## Related

- Tina: [Tina blog setup](/posts/guides/tina-blog) (same `NEXT_PUBLIC_TINA_*` and `TINA_TOKEN` names).
- [Setup hub](/posts/guides/setup-hub) for the full variable list.

[Back to setup hub](/posts/guides/setup-hub)
