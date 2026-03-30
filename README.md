# Portfolio Website Template

Next.js 14 (App Router) and Tailwind CSS portfolio starter. Placeholder content uses **Usagi** (うさぎ) as a nod to _Chiikawa_ (ちいかわ) by Nagano — not an official tie-in. Fictional labels (e.g. **Carrot Valley Institute**) are intentional so you can fork without exposing real details.

## Demo

![Screen recording: hero with typing + 3D model, About section, NetEase music player](./public/demo.gif)

## Scope

The project structure aligns with common beginner portfolio tutorials (e.g. [this walkthrough](#references)). That material covers a **minimal** multi-section page. **This repository extends that baseline** with a distinct visual system, structured data files, server routes, and interactive features listed below.

### Capabilities

- 🎨 **UI** — Solarized-inspired light/dark theme, refined layout and typography, custom cursor assets (`public/usagi_cursor/`, `src/styles/cursor.css`).
- 🐰 **Hero** — Interactive **GLB** character via React Three Fiber / Drei (mouse-driven motion, optional hover audio).
- 📌 **Experience** — Vertical **timeline** with expandable entries (`src/data/timelineItems.js`).
- 🪟 **Draggable panels** — Hobby-style windows using `react-draggable`; reusable for galleries or other floating content.
- 🎵 **Music** — NetEase-backed player (`/api/netease/*`): playlists, playback URLs, lyrics, quality handling, artwork; state persists across client-side navigation.
- ✉️ **Contact** — Form with Google reCAPTCHA v2; email delivery documented for EmailJS or a server route.
- 📚 **Content** — Data-driven education, projects, certifications/awards, and related sections (see customization list).
- 🛠️ **Tooling** — Dynamic imports for heavier sections, optional webpack bundle analyzer (`ANALYZE=true`).

📖 **Documentation:** [Template setup](docs/TEMPLATE_SETUP.md) (env, email, NetEase, compliance) · [3D model](docs/3D_MODEL.md) · [Music player notes](docs/MUSIC_PLAYER.md).

## Showing video (or motion) in this README

GitHub’s README renderer **does not** support embedded iframes (e.g. YouTube `<iframe>`). These options work reliably:

| Approach | Markdown example | Notes |
|----------|------------------|--------|
| **Animated GIF** | `![Demo](./public/demo.gif)` | This repo uses `public/demo.gif`; autoplays on GitHub—keep file size reasonable. |
| **Link only** | `[Watch full demo on YouTube](https://www.youtube.com/watch?v=VIDEO_ID)` | Best quality; opens off-site. |
| **Thumbnail → video** | `[![Demo thumbnail](./docs/demo-thumb.png)](https://www.youtube.com/watch?v=VIDEO_ID)` | Clickable preview image. |
| **Repo-relative image** | `![Screenshot](./docs/screenshot.png)` | Same as GIF but static. |

Optional: upload an MP4 in a GitHub **Issue** comment, copy the `https://user-images.githubusercontent.com/...mp4` URL, and try a raw `<video controls src="..."></video>` block—support can vary by viewer; **GIF or thumbnail+link** remain the most portable.

## What to customize first

1. **`src/app/layout.js`** — `title` and `description` metadata.
2. **`src/components/home/hero/HeroTextContent.jsx`** — Name, rotating titles, resume link.
3. **`src/components/about/AboutSection.jsx`** — Bio and profile image under `/public/images/...`.
4. **`src/components/layout/Navbar.jsx`** — Social URLs.
5. **`src/components/layout/Logo.jsx`** — Logo asset in `/public/images/`.
6. **`src/data/timelineItems.js`** — Work timeline.
7. **`src/data/educationData.js`** — Degrees, courses, teaching (if used).
8. **`src/data/projectData.js`** — Projects and links.
9. **`src/data/tabData.js`** — Certifications and awards (if used).

Placeholder SVGs: `public/images/` (`avatar-placeholder.svg`, `logo-template.svg`, `school-placeholder.svg`, `experience/placeholder-company.svg`).

## Development

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Production

```bash
npm run build
npm start
```

## Bundle analyzer

```bash
ANALYZE=true npm run build
```

Output: `.next/analyze/client.html`.

## Before publishing

- Replace placeholder strings (`your-username`, `your-profile`, `example.edu`, etc.).
- Store secrets in `.env.local` only; verify `.gitignore` excludes `.env*`.

## Credits

Layout patterns derive from common Next.js portfolio tutorials. [LICENSE](LICENSE) retains copyright notice from an earlier fork in that lineage.

## References

### Video

- [Portfolio / Next.js walkthrough](https://www.youtube.com/watch?v=K-hGb9W6wHc) — introductory scaffold; this repo adds the capabilities above.

### Documentation (this repository)

- [Template setup](docs/TEMPLATE_SETUP.md) — Contact (reCAPTCHA, EmailJS, `/api/email/send`), NetEase player, environment variables, copyright.
- [3D model](docs/3D_MODEL.md) — GLB workflow, scene setup, performance.
- [Music player](docs/MUSIC_PLAYER.md) — UI-oriented notes (NetEase operations covered in template setup).

### Core technologies

- [Next.js](https://nextjs.org/docs) · [Tailwind CSS](https://tailwindcss.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) · [@react-three/drei](https://github.com/pmndrs/drei) · [three.js](https://threejs.org/docs/)
- [Framer Motion](https://www.framer.com/motion/)
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) (npm `NeteaseCloudMusicApi`) — subject to NetEase terms and applicable law.

### Service consoles (configuration)

- [Google reCAPTCHA](https://www.google.com/recaptcha/admin) · [EmailJS](https://www.emailjs.com/)

### Theme and IP

- _Chiikawa_ / Usagi theming is **non-commercial placeholder** only. For a public site, replace assets and copy with your own branding and ensure you have rights to any third-party IP you retain.
