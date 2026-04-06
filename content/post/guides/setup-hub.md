---
title: Project setup hub
---

Use these guides to wire optional features. Copy **`.env.example`** to **`.env.local`** for local secrets (gitignored). Never commit tokens.

For the full reference maintained with the code, see **`docs/TEMPLATE_SETUP.md`**.

---

## Guides

| Topic | Article |
|--------|---------|
| **Vercel: where to put env vars** | [Vercel environment variables](/posts/guides/vercel-environment-variables) |
| Blog (Tina CMS), `/posts`, `/admin` | [Tina blog setup](/posts/guides/tina-blog) |
| Contact form (reCAPTCHA + EmailJS) | [Contact form: reCAPTCHA and EmailJS](/posts/guides/contact-emailjs-recaptcha) |
| GitHub card on About | [GitHub profile and token](/posts/guides/github-about-card) |
| Music player (NetEase playlist) | [NetEase music player](/posts/guides/netease-music-player) |
| Unique visitor counter (Redis) | [Visitor counter (Upstash)](/posts/guides/visitor-counter-upstash) |

---

## Environment variables (quick reference)

| Variable | Scope | Where to configure |
|----------|--------|---------------------|
| `NEXT_PUBLIC_TINA_CLIENT_ID` | Client / CLI | [app.tina.io](https://app.tina.io) |
| `TINA_TOKEN` | Server / CLI | Tina project → Tokens |
| `NEXT_PUBLIC_TINA_BRANCH` | Optional | Tina / git branch |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Client | [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) |
| `RECAPTCHA_SECRET_KEY` | Server only | Google (optional server verify) |
| EmailJS keys / template IDs | App code or env | [emailjs.com](https://www.emailjs.com) |
| `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` | Client | Playlist id from [music.163.com](https://music.163.com) |
| `NEXT_PUBLIC_GITHUB_USERNAME` | Client | Your GitHub login |
| `GITHUB_TOKEN` | Server only | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `UPSTASH_REDIS_REST_URL` | Server | [console.upstash.com](https://console.upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Upstash Redis → REST API |

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Tina dev + Next.js (see Tina guide) |
| `npm run build` | Tina Cloud build + `next build` (needs `TINA_TOKEN` + client id) |
| `npm run build:local` | Local Tina build without Cloud (CI / offline) |
