---
title: GitHub card on About
---

**`GitHubStats`** calls **`/api/github/stats`** (`src/components/about/GitHubStats.jsx`, `src/app/api/github/stats/route.js`): public profile, stars on public repos, heatmap.

**Username:**

```bash
NEXT_PUBLIC_GITHUB_USERNAME=your_login
```

Default if unset: **`octocat`**.

**Optional token** ([github.com/settings/tokens](https://github.com/settings/tokens)): fine-grained read-only on public data, or classic with **`read:user`**. Higher API limits + approximate yearly contribution count.

```bash
GITHUB_TOKEN=ghp_...
```

Never **`NEXT_PUBLIC_*`**. Restart dev / redeploy. Rotate if leaked.

[Setup hub](/posts/guides/complete-project-configuration)
