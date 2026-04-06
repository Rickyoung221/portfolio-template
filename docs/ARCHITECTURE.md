# Architecture

Next.js 14 App Router. [Mermaid on GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) may occasionally fail to load; **tables below** are the fallback.

## Routes

| Path | Notes |
|------|--------|
| `/` | Hero → About → Projects → Email (see `src/app/page.js`) |
| `/about` | About page |
| `/projects` | Projects listing |
| `/posts` | Blog index (Tina `content/post/`) |
| `/posts/…` | Blog post (catch-all; supports subfolders / Unicode paths) |
| `/admin` | Tina CMS (rewrites to `public/admin/index.html` after `tinacms build`) |
| `/hobbies` | Draggable windows |
| `/contact` | Contact page |

## API routes

| Route | Backend |
|-------|---------|
| `GET` / `POST` `/api/visitors` | Upstash Redis |
| `GET` `/api/github/stats` | GitHub |
| `/api/netease/playlist`, `/song/detail`, `/song/url`, `/lyric` | NetEase |

## Diagrams (Mermaid)

### System overview

```mermaid
flowchart TB
  subgraph Client["Browser"]
    UI["React UI"]
    R3F["R3F / Three.js hero"]
    UI --- R3F
  end

  subgraph NextApp["Next.js"]
    Pages["Pages + RootLayout"]
    API["/api/*"]
    Pages --> UI
  end

  subgraph Data["Data & lib"]
    D["src/data/*"]
    T["ThemeContext"]
    L["src/lib/*"]
  end

  subgraph Ext["External"]
    Redis[(Upstash)]
    GH[GitHub]
    NE[NetEase]
  end

  Client --> NextApp
  UI --> D
  UI --> T
  API --> L
  L --> Redis
  API --> GH
  API --> NE
```

### Root layout (`src/app/layout.js`)

```mermaid
flowchart TB
  Root["html / body"]
  TP["ThemeProvider"]
  MP["MusicPlayerProvider"]
  Shell["wrapper div"]
  N["Navbar"]
  M["main → children"]
  F["Footer"]
  VT["VisitorTracker"]
  CC["CustomCursor"]

  Root --> TP --> MP --> Shell
  Shell --> N
  Shell --> M
  Shell --> F
  Shell --> VT
  Shell --> CC
```

## Notes

- Home lazy-loads heavy sections (`ProjectsSection` with `ssr: false`, etc.).
- Redis is optional; set `UPSTASH_REDIS_*` for visitors / limits. Details: [Template setup](TEMPLATE_SETUP.md).
