---
title: Visitor counter (Upstash Redis)
---

**`VisitorTracker`**: **`POST /api/visitors`**. About **`SiteVisitorStats`**: **`GET`**. Upstash backend; about **one increment per client per hour**. Missing env: notice only, no count.

1. [console.upstash.com](https://console.upstash.com): Redis database, **REST API** (not **`rediss://`** TCP).
2. **`.env.local`:**

```bash
UPSTASH_REDIS_REST_URL=https://your-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

Mirror on Vercel **Settings > Environment Variables**.

**Display:** **`src/data/siteMeta.js`**: **`SITE_LAUNCH_DATE`**, optional **`VISITOR_COUNT_DISPLAY_OFFSET`** (display only).

Counts are approximate (IP headers); may count as personal data in some regions.

[Setup hub](/posts/guides/complete-project-configuration)
