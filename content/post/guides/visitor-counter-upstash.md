---
title: Visitor counter (Upstash Redis)
---

**`VisitorTracker`** sends **`POST /api/visitors`** once per page load. The About page uses **`SiteVisitorStats`** via **`GET`**. Counts are stored in **Upstash Redis**; each client identifier can increment at most **once per hour** (deduplication).

Implementation: **`src/app/api/visitors/route.js`**, **`src/lib/redisContext.js`**, **`src/components/visitors/*`**.

If Redis environment variables are **missing**, the UI still renders with a short notice and **does not** increment.

---

## Website

| What | URL |
|------|-----|
| Create a Redis database and copy REST credentials | [https://console.upstash.com](https://console.upstash.com) |

---

## Steps

1. Sign in at **[console.upstash.com](https://console.upstash.com)** (GitHub or Google sign-in works).
2. **Create database** and choose **Redis** (a regional database is usually enough).
3. Open the database and find **REST API** (or **Connect** > REST).
4. Copy:

   - **`UPSTASH_REDIS_REST_URL`**: looks like `https://xxxx.upstash.io`
   - **`UPSTASH_REDIS_REST_TOKEN`**: long secret string

   Use **REST** credentials, not the **`rediss://`** TCP connection string.

---

## Environment variables

Add to **`.env.local`** and to your host (e.g. Vercel **Settings** > **Environment Variables**):

```bash
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

---

## Optional display tweaks

In **`src/data/siteMeta.js`**:

- **`SITE_LAUNCH_DATE`**: ISO date **`YYYY-MM-DD`**
- **`VISITOR_COUNT_DISPLAY_OFFSET`**: optional number added **only** to the displayed count (not stored in Redis)

---

## Privacy

The API prefers **`CF-Connecting-IP`**, **`X-Forwarded-For`**, or **`X-Real-Ip`**, otherwise a placeholder. Counts are **approximate**. A simple counter may still be treated as personal data in some regions.

[Back to setup hub](/posts/guides/setup-hub)
