# Architecture

High-level diagrams for **portfolio-website-template** (Next.js 14 App Router).

**Why plain text:** GitHub’s Mermaid renderer sometimes fails to load (`viewscreen.githubusercontent.com` chunk errors). Everything below is **ASCII and Markdown only**—it renders in any viewer without JavaScript diagrams.

---

## System overview

Browser UI talks to the Next.js app; route handlers use `src/lib` and optional external APIs.

```
                         ┌─────────────────────────────────┐
                         │            Browser               │
                         │  React UI · R3F / Three.js hero  │
                         └───────────────┬─────────────────┘
                                         │
                                         ▼
                         ┌─────────────────────────────────┐
                         │      Next.js App Router          │
                         │  pages + RootLayout + /api/*     │
                         └───────────────┬─────────────────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │  src/data/*  │              │ ThemeContext │              │  src/lib/*   │
    │  site config │              │              │              │ Redis, utils │
    └──────────────┘              └──────────────┘              └──────┬───────┘
                                                                       │
           ┌─────────────────────────────┬─────────────────────────────┤
           ▼                             ▼                             ▼
    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │ Upstash Redis│              │  GitHub API  │              │ NetEase API  │
    │ (optional)   │              │ (stats)      │              │ (music)      │
    └──────────────┘              └──────────────┘              └──────────────┘
```

**Relationships (summary)**

| From | To |
|------|-----|
| Page components | `src/data/*`, `ThemeContext` |
| `/api/*` handlers | `src/lib/*` (e.g. Redis, rate limits) |
| Visitor / limit logic | Upstash Redis when env vars are set |
| `/api/github/stats` | GitHub |
| `/api/netease/*` | NetEase (via `NeteaseCloudMusicApi`) |

---

## Routes and home page

**App routes**

| Path | Role |
|------|------|
| `/` | Landing: hero, about preview, projects, contact email section |
| `/about` | About page |
| `/projects` | Projects listing |
| `/hobbies` | Hobbies / draggable windows |
| `/contact` | Contact page |

**Home (`/`) section order (simplified)**

```
  /
  ├── HeroSection          (HeroModel / 3D scene)
  ├── AboutSection         (e.g. GitHubStats)
  ├── ProjectsSection      (dynamic import, client-only where configured)
  └── EmailSection
```

---

## API routes and backends

| API route | Backend / purpose |
|-----------|-------------------|
| `GET` / `POST` `/api/visitors` | Upstash Redis (unique visits, rate limits) |
| `GET` `/api/github/stats` | GitHub (public profile / repo stats) |
| `/api/netease/playlist` | NetEase |
| `/api/netease/song/detail` | NetEase |
| `/api/netease/song/url` | NetEase |
| `/api/netease/lyric` | NetEase |

---

## Root layout shell

Nesting around `{children}` (see `src/app/layout.js`).

```
html / body
└── ThemeProvider
    └── MusicPlayerProvider
        └── theme wrapper div
            ├── Navbar
            ├── main  →  {children}
            ├── Footer
            ├── VisitorTracker
            └── CustomCursor
```

---

## Implementation notes

- **Dynamic imports:** The home page lazy-loads heavier sections (e.g. `ProjectsSection` with `ssr: false`, `AboutSection`, `EmailSection`) to reduce initial bundle work.
- **Theme & audio:** `ThemeProvider` and `MusicPlayerProvider` wrap the app so theme and player state survive client-side navigation.
- **Optional Redis:** Visitor APIs and rate limiting use Upstash when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set; otherwise routes degrade gracefully where implemented.

See [Template setup](TEMPLATE_SETUP.md) for environment variables and operational details.

---

### Optional: Mermaid elsewhere

If you want interactive Mermaid diagrams locally, paste the same structure into [mermaid.live](https://mermaid.live) or use a VS Code Mermaid extension; this file intentionally avoids fenced `mermaid` blocks so GitHub’s README/doc view stays error-free.
