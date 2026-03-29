# Portfolio Website Template

Next.js + Tailwind CSS portfolio starter. The placeholder persona is **Usagi** (うさぎ), the rabbit character from **Chiikawa** (ちいかわ) by Nagano — used here with a nod to that series, not as an official tie-in. **Carrot Valley Institute** and other names are fake so you can fork the layout without publishing private details.

## What to customize first

1. **`src/app/layout.js`** — site `title` and `description` metadata.
2. **`src/components/home/hero/HeroTextContent.jsx`** — hero name, rotating titles, resume link.
3. **`src/components/about/AboutSection.jsx`** — bio text and profile image path (`/public/images/...`).
4. **`src/components/layout/Navbar.jsx`** — GitHub, LinkedIn, and Instagram URLs.
5. **`src/components/layout/Logo.jsx`** — logo asset in `/public/images/`.
6. **`src/data/timelineItems.js`** — work and education timeline.
7. **`src/data/educationData.js`** — degrees, courses, teaching (if used).
8. **`src/data/projectData.js`** — project cards and repository links.
9. **`src/data/tabData.js`** — certifications and awards sections.

Placeholder SVGs live under `public/images/` (`avatar-placeholder.svg`, `logo-template.svg`, `school-placeholder.svg`, `experience/placeholder-company.svg`).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

## Bundle analyzer

```bash
ANALYZE=true npm run build
```

Report: `.next/analyze/client.html`.

## Notes

- **Contact form, reCAPTCHA, NetEase player:** see [docs/TEMPLATE_SETUP.md](docs/TEMPLATE_SETUP.md) for env vars, EmailJS vs `/api/email/send`, and copyright guidance.
- **Hero 3D model (GLB, R3F):** see [docs/3D_MODEL.md](docs/3D_MODEL.md) for file layout, swapping assets, camera/light tweaks, and performance.
- Replace every `your-username`, `your-profile`, and `example.edu` string before publishing.
- Keep secrets in `.env.local` only; confirm `.gitignore` excludes `.env*`.

## Credits

Original structure inspired by common Next.js portfolio tutorials; this fork is sanitized for reuse as a template.
