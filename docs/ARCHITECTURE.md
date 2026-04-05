# Architecture

High-level diagrams for **portfolio-website-template** (Next.js 14 App Router). Mermaid blocks render on GitHub; for local editing, use a Mermaid-compatible preview or [mermaid.live](https://mermaid.live).

## System overview

Client UI, Next.js boundaries, data/config, and external services.

```mermaid
flowchart TB
  subgraph Client["Browser"]
    UI["React pages & components"]
    R3F["Three.js / React Three Fiber\n(Hero 3D model)"]
    UI --- R3F
  end

  subgraph NextApp["Next.js App Router"]
    Pages["Pages: /, /about, /projects, /hobbies, /contact"]
    Layout["RootLayout\nThemeProvider · MusicPlayerProvider\nNavbar · Footer · VisitorTracker · CustomCursor"]
    API["Route handlers /api/*"]
    Pages --> Layout
    Layout --> UI
  end

  subgraph DataLayer["Data & config"]
    StaticData["src/data/*\nprojects, skills, timeline, site meta"]
    ThemeCtx["ThemeContext"]
    Lib["src/lib/*\nRedis helpers, visitor constants, site age, etc."]
  end

  subgraph External["External services"]
    Redis[(Upstash Redis\nrate limits & visitors)]
    GH["GitHub API\n(stats)"]
    Netease["NetEase Cloud Music API\n(NeteaseCloudMusicApi)"]
  end

  Client --> NextApp
  UI --> StaticData
  UI --> ThemeCtx
  API --> Lib
  Lib --> Redis
  API --> GH
  API --> Netease
```

## Routes and home page composition

```mermaid
flowchart LR
  subgraph Routes["Routes"]
    H["/"]
    A["/about"]
    P["/projects"]
    Ho["/hobbies"]
    C["/contact"]
  end

  subgraph HomeBlocks["Home (/) sections"]
    Hero["HeroSection\n+ HeroModel / Scene"]
    About["AboutSection\n+ GitHubStats, etc."]
    Proj["ProjectsSection"]
    Email["EmailSection"]
  end

  H --> Hero
  H --> About
  H --> Proj
  H --> Email
```

## API routes and dependencies

```mermaid
flowchart LR
  V["GET/POST /api/visitors"]
  G["GET /api/github/stats"]
  N1["/api/netease/playlist"]
  N2["/api/netease/song/detail"]
  N3["/api/netease/song/url"]
  N4["/api/netease/lyric"]

  V --> Redis[(Upstash Redis)]
  G --> GH[GitHub]
  N1 & N2 & N3 & N4 --> NM[NetEase]
```

## Root layout shell

Global providers and chrome around `{children}`.

```mermaid
flowchart TB
  Root["html / body"]
  TP["ThemeProvider"]
  MP["MusicPlayerProvider"]
  Shell["theme wrapper div"]
  N["Navbar"]
  M["main {children}"]
  F["Footer"]
  VT["VisitorTracker"]
  CC["CustomCursor"]

  Root --> TP
  TP --> MP
  MP --> Shell
  Shell --> N
  Shell --> M
  Shell --> F
  Shell --> VT
  Shell --> CC
```

## Implementation notes

- **Dynamic imports:** The home page lazy-loads heavier sections (e.g. `ProjectsSection` with `ssr: false`, `AboutSection`, `EmailSection`) to reduce initial bundle work.
- **Theme & audio:** `ThemeProvider` and `MusicPlayerProvider` wrap the app so theme and player state survive client-side navigation.
- **Optional Redis:** Visitor APIs and rate limiting use Upstash when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set; otherwise routes degrade gracefully where implemented.

See [Template setup](TEMPLATE_SETUP.md) for environment variables and operational details.
