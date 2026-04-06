---
title: NetEase Cloud Music player
---

Uses **`NeteaseCloudMusicApi`** and **`/api/netease/`**. No separate dev signup.

**Playlist ID:** [music.163.com](https://music.163.com) or the mobile app share link; the **`id`** query param is the playlist ID (example: `...playlist?id=1234567890`).

```bash
NEXT_PUBLIC_NETEASE_PLAYLIST_ID=your_playlist_id
```

Defaults: **`MusicPlayerProvider.jsx`**. Set your own in production. Cover images: **`next.config.js`**, **`images.remotePatterns`**.

**Rights:** Only stream what you may use on a public site; most NetEase tracks are not licensed for that.

[Setup hub](/posts/guides/complete-project-configuration)
