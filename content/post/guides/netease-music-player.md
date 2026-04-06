---
title: NetEase Cloud Music player
---

The player uses **`NeteaseCloudMusicApi`** and routes under **`/api/netease/`**. There is **no separate developer signup** for this template.

**Legal:** You must only play audio you have the right to use on a **public** website. Most commercial tracks on NetEase are **not** licensed for arbitrary web playback. Use your own audio or properly licensed material when possible.

---

## Website

| What | URL |
|------|-----|
| Web player (open a playlist and read the URL) | [https://music.163.com](https://music.163.com) |
| Mobile app | NetEase Cloud Music app **Share** on a playlist; the link contains the numeric id. |

The playlist id usually appears in the URL as `playlist?id=...` (digits only).

---

## Environment variable

```bash
NEXT_PUBLIC_NETEASE_PLAYLIST_ID=your_playlist_id
```

Set this in **`.env.local`** for production so you do not rely on the built-in demo playlist. Default logic: **`src/components/music-player/MusicPlayer/MusicPlayerProvider.jsx`**.

The UI can also change the playlist id at runtime; metadata is loaded via **`GET /api/netease/playlist?id=...`**.

Cover art may load from NetEase CDNs; allowed hosts are listed in **`next.config.js`** under **`images.remotePatterns`**.

[Back to setup hub](/posts/guides/setup-hub)
