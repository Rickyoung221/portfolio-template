# Template setup guide

This project ships with a contact form, an optional music player, an optional **GitHub** profile card, an optional **visitor counter** (Upstash Redis), and an optional **Tina CMS**-backed **blog** at `/posts` (Markdown under `content/post/`). Follow the sections below to wire them up safely. **You are responsible for complying with copyright, terms of service, and privacy laws** in your jurisdiction.

---

## Tina CMS (blog)

1. Create a project at [app.tina.io](https://app.tina.io), connect this GitHub repository, and create a **read token** (`TINA_TOKEN`).
2. Add to `.env.local` (never commit):

   ```bash
   NEXT_PUBLIC_TINA_CLIENT_ID=<from Tina dashboard>
   TINA_TOKEN=<server token>
   NEXT_PUBLIC_TINA_BRANCH=main
   ```

3. **Development**: `npm run dev` runs Tina’s GraphQL sidecar and Next together (`scripts/tina-dev.cjs`).
4. **Production / Vercel**: set the same three variables in the project **Environment Variables** UI. `npm run build` runs `tinacms build` then `next build` (`scripts/tina-next-build.cjs`).
5. **Content**: edit Markdown in `content/post/` (nested folders are supported). **Admin UI**: after a production build, open `/admin` on your site. Use **Unicode path segments** in URLs for non-ASCII folder names (do not rely on `%`-encoded folder names in the admin hash—see `src/lib/blog-path.js`).

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

Blog posts (`/posts/...`) mount **`PostEngagement`**, which uses the **same** Redis credentials: **`GET` / `POST` `/api/post-engagement/likes`** (one like per visitor IP per post, toggle off to unlike) and **`GET` / `POST` `/api/post-engagement/comments`** (newest-first list, capped at 200 per post). Code: `src/components/post-engagement/PostEngagement.jsx` (rendered from `src/app/posts/[...filename]/page.js` so the path does not depend on Tina client data), `src/app/api/post-engagement/*`.

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
- Blog (links to guides in `content/post/guides/`): [BLOG.md](./BLOG.md)
- Hero 3D model (GLB, React Three Fiber): [3D_MODEL.md](./3D_MODEL.md)
- Music player UI and NetEase integration: `src/components/music-player/MusicPlayer/MusicPlayerProvider.jsx` and `src/app/api/netease/`
