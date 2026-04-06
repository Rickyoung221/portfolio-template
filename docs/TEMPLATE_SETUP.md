# Template setup guide

This project ships with a contact form, an optional music player, an optional **GitHub** profile card, an optional **visitor counter** (Upstash Redis), and an optional **blog** (Tina CMS). Follow the sections below to wire them up safely. **You are responsible for complying with copyright, terms of service, and privacy laws** in your jurisdiction.

---

## Blog (Tina CMS)

Posts live in **`content/post/`** as Markdown (`.md`). Subfolders appear as grouped sections on **`/posts`**. The visual editor is at **`/admin`** (after a production build) or via the Tina dev server when running `npm run dev`.

### 1. Create a Tina Cloud project

1. Sign in at **[app.tina.io](https://app.tina.io)** and create a project.
2. Connect the **same GitHub repository** you deploy from (so Tina can index content on the branch you edit).
3. Copy the **Client ID** from the Tina dashboard.

### 2. Create a token for builds

1. In Tina → your project → **Tokens** (or equivalent), create a **read/write** token for CLI / CI.
2. Store it only in **`.env.local`** (local) and your host’s **Environment Variables** (Vercel, etc.) as **`TINA_TOKEN`**. Do not commit it.

### 3. Local environment

In **`.env.local`** (never commit):

```bash
NEXT_PUBLIC_TINA_CLIENT_ID=your-client-id-uuid
TINA_TOKEN=your_tina_token
# Optional; defaults to your current git branch / Vercel’s git ref
# NEXT_PUBLIC_TINA_BRANCH=main
```

Alternatively, for **client id only** (some setups), copy `tina/tina.local.example.json` → **`tina/tina.local.json`** (gitignored) and set `"clientId"`.

### 4. Commands

- **`npm run dev`** — Tina dev (GraphQL on port **4001**) + Next.js. Deletes stale `public/admin` so the admin UI talks to the local schema.
- **`npm run build`** — Runs **`tinacms build`** then **`next build`**. Requires **`TINA_TOKEN`** and **`NEXT_PUBLIC_TINA_CLIENT_ID`** in the environment (e.g. Vercel). Outputs the static admin bundle under **`public/admin/`**.

### 5. GitHub Actions

The workflow runs **`npm run build`**. Add repository **secrets**: **`NEXT_PUBLIC_TINA_CLIENT_ID`** and **`TINA_TOKEN`**. Optionally set a repository **variable** **`NEXT_PUBLIC_TINA_BRANCH`** (e.g. `main`). Forks without these secrets will fail the build until configured.

### 6. Paths and non-ASCII folder names

Use **Unicode folder/file names** in the repo (e.g. `content/post/notes/café.md`). The template’s **`ui.router`** and `/posts` links use **unencoded** path segments so Tina Admin’s hash URL matches GraphQL `relativePath`. See `src/lib/blog-path.js`.

### 7. Generated files

- **`tina/tina-lock.json`** — Commit after schema changes; keeps Tina Cloud in sync with your collections.
- **`tina/__generated__/`** — The repo includes a **local-dev** GraphQL client (`http://localhost:4001/graphql`). Running **`npm run build`** on the host (Vercel, etc.) runs **`tinacms build` first**, which **overwrites** this folder with the **Tina Cloud** endpoint and a read-only token as needed.
- **`public/admin`** — Gitignored; created by **`tinacms build`** (not by `tinacms dev`).

---

## Contact form (EmailJS + reCAPTCHA)

The contact UI lives in `src/components/contact/EmailSection.jsx`. It posts JSON to `/api/email/send` by default. You can keep that pattern and implement the route with EmailJS on the server, or switch the client to call EmailJS directly—pick one approach and avoid exposing private API keys in the browser.

### 1. Google reCAPTCHA (v2)

1. Register your site in [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
2. Create keys for **reCAPTCHA v2** (“I’m not a robot” checkbox), matching your domains (e.g. `localhost` for development and your production domain).
3. Add to `.env.local` (never commit this file):

   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
   ```

4. If your server-side email route verifies the token, store the **secret key** only in server env (e.g. `RECAPTCHA_SECRET_KEY`) and verify with Google’s API inside `/api/email/send`.

Without `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, the form shows an error state in development.

### 2. EmailJS (typical client-side flow)

[EmailJS](https://www.emailjs.com/) sends email from the browser using a public key and a service/template you configure in their dashboard.

1. Create an EmailJS account and connect an **email service** (Gmail, Outlook, etc.) per their docs.
2. Create an **email template** with fields that match your form (`name`, `email`, `subject`, `message`, etc.).
3. Note your **Public Key**, **Service ID**, and **Template ID**.

To use EmailJS from React instead of a custom API route, replace the `fetch('/api/email/send', …)` call in `EmailSection.jsx` with `emailjs.send` (from `@emailjs/browser`) and pass the same form fields. Keep the reCAPTCHA check before sending.

**Security notes**

- Prefer **domain restrictions** and EmailJS **allowed origins** where available.
- Rate-limit and monitor your EmailJS dashboard for abuse.
- Do not commit EmailJS private keys or non-public credentials; use env vars and server-side verification when possible.

### 3. Custom `/api/email/send` route

If you implement `src/app/api/email/send/route.js` (or `.ts`), you can call EmailJS’s REST API from the server with a private key, or use Resend, SendGrid, etc. Ensure you validate input, verify reCAPTCHA on the server, and return appropriate HTTP status codes.

---

## Music player & NetEase playlists

The built-in player uses **NetEase Cloud Music** playlist data through server routes under `/api/netease/` (powered by the `NeteaseCloudMusicApi` package). Cover art may load from NetEase CDNs; see `next.config.js` → `images.remotePatterns` for allowed hosts.

### 1. Default playlist ID (code)

In `src/components/music-player/MusicPlayer/MusicPlayerProvider.jsx`, the default NetEase playlist ID is read from `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` when set, otherwise a built-in demo ID is used. **Set `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` in `.env.local` for production** so you do not ship someone else’s list by accident.

### 2. Changing the playlist in the UI

The player UI includes a way to **enter a playlist ID** and apply it (typically confirm with **Enter** in the input—see `handlePlaylistIdChange` in the same file). After you change the ID, the app fetches metadata via:

`GET /api/netease/playlist?id=<your_playlist_id>`

### 3. Finding a NetEase playlist ID

From the NetEase Cloud Music app or website, open a playlist’s share link. The URL usually contains the numeric **playlist id** (often after `playlist?id=` or similar). Use **only** playlists you control or have permission to reference.

### 4. Copyright and licensing (read this before going live)

**You must only stream audio you have the right to use on your public website.**

- Tracks on NetEase are **commercial recordings** in most cases. Playing them on your portfolio is **not** the same as personal listening; it can infringe **copyright**, breach **NetEase’s terms of use**, and create **DMCA / takedown** risk depending on region.
- **Recommended for a template / public demo:**
  - Use a playlist of **your own** music, or
  - **Royalty-free / CC-licensed** audio you are allowed to redistribute and play on the web (with **attribution** if required), hosted or linked in a way that matches the license.
- Some songs return **errors or 404** from the API when rights do not allow playback; the player may stop rather than skip endlessly—**do not rely on that as legal protection**.

If you are unsure, **disable the player** or point it only at content you own or have explicit written permission to stream.

### 5. Operational tips

- **Rate limits**: NetEase and proxies may throttle; avoid hammering the API in loops.
- **Region**: availability of tracks and APIs can differ by country.
- **Production**: use env-based playlist IDs and consider hiding the player until you have compliant content.

---

## GitHub profile card (About page)

The **About** section includes `GitHubStats`, which calls `GET /api/github/stats` to load public profile data, sum **stargazers** across your **public** repositories (paginated), and show a contribution heatmap image (third-party SVG). Implementation: `src/components/about/GitHubStats.jsx`, `src/app/api/github/stats/route.js`.

### 1. Username (required for your profile)

In `.env.local`:

```bash
NEXT_PUBLIC_GITHUB_USERNAME=your_github_login
```

If unset, the template defaults to `octocat` for demo purposes.

### 2. `GITHUB_TOKEN` (optional, server-only)

Without a token, GitHub’s **anonymous** REST API quota is low (per IP); builds or heavy local testing can hit **rate limits**. With a token, limits are much higher and the route can call the **GraphQL API** to show your **approximate last-year contribution total** (same idea as the green squares on GitHub).

1. Open [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) and create a **classic** token (or a **fine-grained** token with read-only access appropriate for public data).
2. For classic tokens, scope **`read:user`** (and public read as needed) is enough for typical public profile + contribution queries.
3. Add **only** to `.env.local` (never `NEXT_PUBLIC_*`):

   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   ```

4. Restart `next dev` / redeploy so the server picks up the variable.

**Security:** Treat the token like a password. Do not commit it, paste it into client code, or share it in screenshots. Rotate it if it leaks.

---

## Visitor counter (Upstash Redis)

The layout mounts `VisitorTracker`, which sends **`POST /api/visitors`** once on load. The **About** page shows `SiteVisitorStats`, which **`GET`s** the current count. Counts are stored in **Upstash Redis**; each client identifier (see below) can increment the global counter **at most once per hour** (deduplication). Code: `src/app/api/visitors/route.js`, `src/lib/redisContext.js`, `src/components/visitors/*`.

If Redis env vars are **missing**, the UI still renders but shows a short notice and **does not** increment counts.

### 1. Create an Upstash Redis database

1. Sign in at **[Upstash Console](https://console.upstash.com/)** (GitHub/Google signup is fine).
2. **Create database** → choose **Regional** or **Global** Redis (Regional is often enough for a portfolio).
3. Pick a **region** close to your users and confirm creation.

### 2. Copy the REST URL and token

1. Open your database in the console.
2. Scroll to **REST API** (or **Connect** → REST).
3. Copy:
   - **UPSTASH_REDIS_REST_URL** — looks like `https://xxxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN** — long secret string

These are **not** the TCP `rediss://` URL; the template uses the **HTTP REST** credentials only.

### 3. Add to `.env.local`

```bash
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

- Do **not** wrap the URL in quotes unless your host requires it; avoid copying trailing spaces.
- Restart the dev server after saving.

### 4. Production (Vercel, etc.)

Add the **same two variables** in your host’s **Environment Variables** UI for Production (and Preview if you want counts there). Redeploy so API routes see them.

### 5. Customize the About stats card

- **`src/data/siteMeta.js`** — `SITE_LAUNCH_DATE` (ISO `YYYY-MM-DD`) and optional `VISITOR_COUNT_DISPLAY_OFFSET` (added **only** to the displayed number, not to Redis).
- **Project count** in the middle column comes from `getFeaturedProjectCount()` → length of `src/data/projectData.js`.

### 6. Privacy and abuse notes

- The API uses `CF-Connecting-IP`, `X-Forwarded-For`, or `X-Real-Ip` when present, otherwise falls back to a placeholder—**treat visitor counts as approximate**, not a legal analytics product.
- **Rate limits** (Upstash-backed): read and write paths are limited per identifier to reduce abuse; see `src/lib/redisContext.js`.
- **Compliance:** If your jurisdiction requires a cookie banner or DPA for analytics, a simple visit counter may still implicate **personal data** (IP-derived identifiers). Consult your own counsel if you need certainty.

---

## Environment variables (checklist)

| Variable                                     | Where                       | Purpose                                                                 |
| -------------------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_TINA_CLIENT_ID`                 | Client / Tina CLI           | Tina Cloud project client id (blog + `/admin`)                          |
| `TINA_TOKEN`                                 | Server / Tina CLI           | Tina token for `tinacms build` and schema sync                          |
| `NEXT_PUBLIC_TINA_BRANCH` (optional)         | Client / Tina               | Content branch; else git / Vercel ref                                   |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`             | Client                      | reCAPTCHA widget                                                        |
| `RECAPTCHA_SECRET_KEY` (if used)             | Server only                 | Verify token in API route                                               |
| EmailJS / SMTP / provider keys               | Server or client per design | Sending mail                                                            |
| `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` (optional) | Client                      | Default NetEase playlist in the player                                  |
| `NEXT_PUBLIC_GITHUB_USERNAME` (optional)     | Client                      | GitHub login for `/api/github/stats` and `GitHubStats`                  |
| `GITHUB_TOKEN` (optional)                    | Server only                 | Higher GitHub API limits + yearly contribution total in `GitHubStats` |
| `UPSTASH_REDIS_REST_URL`                     | Server only                 | Upstash Redis REST endpoint for `/api/visitors`                         |
| `UPSTASH_REDIS_REST_TOKEN`                   | Server only                 | Upstash REST token (secret)                                             |

Copy `.env.example` to `.env.local` and fill values locally; confirm `.gitignore` excludes `.env*`.

---

## Further reading

- Project overview: [README.md](../README.md)
- Hero 3D model (GLB, React Three Fiber): [3D_MODEL.md](./3D_MODEL.md)
- Music player UI and NetEase integration: `src/components/music-player/MusicPlayer/MusicPlayerProvider.jsx` and `src/app/api/netease/`
