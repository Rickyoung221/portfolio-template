# Template setup guide

This project ships with a contact form and an optional music player. Follow the sections below to wire them up safely. **You are responsible for complying with copyright, terms of service, and privacy laws** in your jurisdiction.

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

## Environment variables (checklist)

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Client | reCAPTCHA widget |
| `RECAPTCHA_SECRET_KEY` (if used) | Server only | Verify token in API route |
| EmailJS / SMTP / provider keys | Server or client per design | Sending mail |
| `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` (optional) | Client | Default NetEase playlist in the player |

Copy `.env.example` to `.env.local` and fill values locally; confirm `.gitignore` excludes `.env*`.

---

## Further reading

- Project overview: [README.md](../README.md)
- Hero 3D model (GLB, React Three Fiber): [3D_MODEL.md](./3D_MODEL.md)
- Music player UI and NetEase integration: `src/components/music-player/MusicPlayer/MusicPlayerProvider.jsx` and `src/app/api/netease/`
