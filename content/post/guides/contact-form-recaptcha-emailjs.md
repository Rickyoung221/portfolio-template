---
title: Contact form: reCAPTCHA and EmailJS
---

UI: **`src/components/contact/EmailSection.jsx`**. Default: **`POST /api/email/send`**. Alternative: **`emailjs.send`** from **`@emailjs/browser`**. Pick one.

**reCAPTCHA v2:** [Google Admin](https://www.google.com/recaptcha/admin): add site, type **v2** "I'm not a robot", domains **localhost** and production, copy **Site key**:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
```

Optional server verify: **`RECAPTCHA_SECRET_KEY`** in **`/api/email/send`** only (never `NEXT_PUBLIC_`). Without the site key, the form errors in dev.

**EmailJS:** [emailjs.com](https://www.emailjs.com): **Email Services**, **Email Templates** (fields like `name`, `email`, `subject`, `message`), **Account > General** for **Public Key**. Wire **`emailjs.init`** and **`emailjs.send`** in **`EmailSection.jsx`**. Use EmailJS domain restrictions; no private keys in **`NEXT_PUBLIC_*`**.

Custom server route: **`src/app/api/email/send/route.js`** (EmailJS REST, Resend, etc.) with validation + optional reCAPTCHA verify.

[Setup hub](/posts/guides/complete-project-configuration)
