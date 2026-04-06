---
title: Template setup hub and env checklist
---

Use **`.env.local`** for secrets (copy **`.env.example`**; never commit). Restart **`npm run dev`** or redeploy after changes. Do not use **`NEXT_PUBLIC_*`** for real secrets.

| Topic | Guide |
|-------|--------|
| Blog (Tina) | [Blog (Tina CMS)](/posts/guides/blog-tina-setup) |
| Contact | [reCAPTCHA and EmailJS](/posts/guides/contact-form-recaptcha-emailjs) |
| About GitHub card | [GitHub stats](/posts/guides/github-about-stats) |
| Music player | [NetEase playlist](/posts/guides/netease-music-player) |
| Visitors | [Upstash counter](/posts/guides/visitor-counter-upstash) |

## Environment variables

| Variable | Scope | Link |
|----------|--------|------|
| `NEXT_PUBLIC_TINA_CLIENT_ID` | Client / CLI | [app.tina.io](https://app.tina.io) |
| `TINA_TOKEN` | Server / CLI | Tina |
| `NEXT_PUBLIC_TINA_BRANCH` | Optional | Tina branch |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Client | [reCAPTCHA Admin](https://www.google.com/recaptcha/admin) |
| `RECAPTCHA_SECRET_KEY` | Server | Google (optional) |
| EmailJS / mail | Varies | [emailjs.com](https://www.emailjs.com) |
| `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` | Client | [music.163.com](https://music.163.com) |
| `NEXT_PUBLIC_GITHUB_USERNAME` | Client | GitHub |
| `GITHUB_TOKEN` | Server | [tokens](https://github.com/settings/tokens) |
| `UPSTASH_REDIS_REST_*` | Server | [Upstash](https://console.upstash.com) |

More detail: **`docs/TEMPLATE_SETUP.md`**, **`README.md`**, **`docs/3D_MODEL.md`**.
