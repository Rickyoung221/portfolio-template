# Portfolio Website Template

Next.js 14 (App Router) and Tailwind CSS portfolio starter. Placeholder content uses **Usagi** (うさぎ) as a nod to _Chiikawa_ (ちいかわ) by Nagano — not an official tie-in. Fictional labels (e.g. **Carrot Valley Institute**) are intentional so you can fork without exposing real details.

## Demo

![Screen recording: hero with typing + 3D model, About section, NetEase music player](./public/demo.gif)

## Scope

The project structure aligns with common beginner portfolio tutorials (e.g. [this walkthrough](#references)). That material covers a **minimal** multi-section page. **This repository extends that baseline** with a distinct visual system, structured data files, server routes, and interactive features listed below.

### Capabilities

- 🎨 **UI** — Solarized-inspired light/dark theme, refined layout and typography, custom cursor assets (`public/usagi_cursor/`, `src/styles/cursor.css`).
- 🐰 **Hero** — Interactive **GLB** character via React Three Fiber / Drei (mouse-driven motion, optional hover audio).
- 📌 **Experience** — Vertical **timeline** with expandable entries (`src/data/timelineItems.js`).
- 🪟 **Draggable panels** — Hobby-style windows using `react-draggable`; reusable for galleries or other floating content.
- 🎵 **Music** — NetEase-backed player (`/api/netease/*`): playlists, playback URLs, lyrics, quality handling, artwork; state persists across client-side navigation.
- 🐙 **GitHub** — About-page card (`GitHubStats`): public profile, summed stars on your public repos, contribution heatmap (via [ghchart.rshah.org](https://ghchart.rshah.org/)); optional PAT for higher API limits and a yearly contribution total.
- 👀 **Visitors** — Unique-visit counter on About (`SiteVisitorStats`) with **Upstash Redis**; `VisitorTracker` in the root layout posts once per session path. Configure REST URL + token in `.env.local` (see [Template setup](docs/TEMPLATE_SETUP.md)).
- ✉️ **Contact** — Form with Google reCAPTCHA v2; email delivery documented for EmailJS or a server route.
- 📝 **Blog** — Optional [Tina CMS](https://tina.io) Markdown blog: listing and posts under `/posts`, visual editor at `/admin`, source files in `content/post/` (see [Blog](#blog-tina-cms) below).
- 📚 **Content** — Data-driven education, projects, certifications/awards, and related sections (see customization list).
- 🛠️ **Tooling** — Dynamic imports for heavier sections, optional webpack bundle analyzer (`ANALYZE=true`).

📖 **Documentation:** [Template setup](docs/TEMPLATE_SETUP.md) · [Architecture](docs/ARCHITECTURE.md) · [3D model](docs/3D_MODEL.md) · [Music player](docs/MUSIC_PLAYER.md).

## Blog (Tina CMS)

The site can serve a **Markdown blog** powered by Tina: pages are generated from `content/post/`, with optional **visual editing** and cloud indexing when you connect [Tina Cloud](https://app.tina.io) to this repository.

### What you get

| URL | Purpose |
| --- | --- |
| `/posts` | Index: posts grouped by subfolder under `content/post/` |
| `/posts/…` | Single post (path mirrors file path, e.g. `content/post/guides/tina-blog.md` → `/posts/guides/tina-blog`) |
| `/admin` | Tina admin UI (after configuring env; dev runs Tina’s GraphQL sidecar with `npm run dev`) |

Media uploads from the admin go to **`public/uploads/`** (see `tina/config.js`). The schema and collections live under **`tina/`**; commit **`tina/tina-lock.json`** when the schema changes.

### Environment variables

Add these to **`.env.local`** (never commit; copy from [`.env.example`](.env.example)):

```bash
NEXT_PUBLIC_TINA_CLIENT_ID=<from Tina dashboard>
TINA_TOKEN=<read token from Tina>
NEXT_PUBLIC_TINA_BRANCH=main   # optional; branch Tina indexes
```

Short reference: [Template setup → Tina CMS](docs/TEMPLATE_SETUP.md#tina-cms-blog).

### Commands

- **`npm run dev`** — Starts Tina’s GraphQL sidecar and Next.js together (`scripts/tina-dev.cjs`). Default GraphQL port is **4001**.
- **`npm run build`** — Runs **`tinacms build`** then **`next build`** (`scripts/tina-next-build.cjs`). Requires `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` for a full cloud build.
- **`npm run build:local`** — Local/offline-friendly variant (see `package.json`) when you need to build without full Tina Cloud checks.

### Tutorials (in-repo)

Step-by-step guides ship as Markdown posts so you can read them **in the app** after `npm run dev`, or in the repo:

| Topic | File | On the site (dev / prod) |
| --- | --- | --- |
| **Tina blog setup** (env, deploy, troubleshooting) | [`content/post/guides/tina-blog.md`](content/post/guides/tina-blog.md) | `/posts/guides/tina-blog` |
| **All setup guides** (contact, music, visitors, Vercel env, etc.) | [`content/post/guides/setup-hub.md`](content/post/guides/setup-hub.md) | `/posts/guides/setup-hub` |

Unicode or non-ASCII paths in folder names are supported; URL handling is documented in **`src/lib/blog-path.js`**.

## What to customize first

1. **`src/app/layout.js`** — `title` and `description` metadata.
2. **`src/components/home/hero/HeroTextContent.jsx`** — Name, rotating titles, resume link.
3. **`src/components/about/AboutSection.jsx`** — Bio and profile image under `/public/images/...`.
4. **`src/components/layout/Navbar.jsx`** — Social URLs.
5. **`src/components/layout/Logo.jsx`** — Logo asset in `/public/images/`.
6. **`src/data/timelineItems.js`** — Work timeline.
7. **`src/data/educationData.js`** — Degrees, courses, teaching (if used).
8. **`src/data/projectData.js`** — Projects and links.
9. **`src/data/tabData.js`** — Certifications and awards (if used).
10. **`src/data/siteMeta.js`** — Launch date and optional visitor-count display offset (About visitor stats card).
11. **`.env.local`** — `NEXT_PUBLIC_GITHUB_USERNAME`, optional `GITHUB_TOKEN`; `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for the visitor counter; optional Tina keys for the blog (see [Blog](#blog-tina-cms) and [Template setup](docs/TEMPLATE_SETUP.md)).
12. **`content/post/`** — Blog posts (Markdown with front matter). Nested folders become sections on `/posts`. Without Tina env vars, you can still edit files locally; production builds and `/admin` need a [Tina Cloud](https://app.tina.io) project.

Placeholder SVGs: `public/images/` (`avatar-placeholder.svg`, `logo-template.svg`, `school-placeholder.svg`, `experience/placeholder-company.svg`).

## Development

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Production

```bash
npm run build
npm start
```

## Bundle analyzer

```bash
ANALYZE=true npm run build
```

Output: `.next/analyze/client.html`.

## Before publishing

- Replace placeholder strings (`your-username`, `your-profile`, `example.edu`, etc.).
- Store secrets in `.env.local` only; verify `.gitignore` excludes `.env*`.
- For **GitHub** and **Upstash**, set production env vars on your host and rotate any token that was ever committed or pasted in public chat.

## Credits

Layout patterns derive from common Next.js portfolio tutorials. [LICENSE](LICENSE) retains copyright notice from an earlier fork in that lineage.

## References

### Video

- [Portfolio / Next.js walkthrough](https://www.youtube.com/watch?v=K-hGb9W6wHc) — introductory scaffold; this repo adds the capabilities above.

### Documentation (this repository)

- [Template setup](docs/TEMPLATE_SETUP.md) — Tina blog, contact (reCAPTCHA, EmailJS, `/api/email/send`), NetEase player, GitHub stats, Upstash visitor counter, environment variables, copyright.
- Blog walkthrough (same content as the `/posts/guides/tina-blog` article): [`content/post/guides/tina-blog.md`](content/post/guides/tina-blog.md).
- [Architecture](docs/ARCHITECTURE.md) — Routes, API map, Mermaid diagrams.
- [3D model](docs/3D_MODEL.md) — GLB workflow, scene setup, performance.
- [Music player](docs/MUSIC_PLAYER.md) — UI-oriented notes (NetEase operations covered in template setup).

### Core technologies

- [Next.js](https://nextjs.org/docs) · [Tailwind CSS](https://tailwindcss.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) · [@react-three/drei](https://github.com/pmndrs/drei) · [three.js](https://threejs.org/docs/)
- [Framer Motion](https://www.framer.com/motion/)
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) (npm `NeteaseCloudMusicApi`) — subject to NetEase terms and applicable law.

### Service consoles (configuration)

- [Google reCAPTCHA](https://www.google.com/recaptcha/admin) · [EmailJS](https://www.emailjs.com/)
- [Upstash](https://console.upstash.com/) (Redis REST URL + token for visitor counts)
- [GitHub tokens](https://github.com/settings/tokens) (optional fine-grained or classic PAT for `/api/github/stats`)

### Theme and IP

- _Chiikawa_ / Usagi theming is **non-commercial placeholder** only. For a public site, replace assets and copy with your own branding and ensure you have rights to any third-party IP you retain.
