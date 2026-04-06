---
title: "Contact form: reCAPTCHA and EmailJS"
---

The contact UI is in **`src/components/contact/EmailSection.jsx`**. It posts JSON to **`/api/email/send`** by default. You can wire **[EmailJS](https://www.emailjs.com)** in the browser (`emailjs.send` from **`@emailjs/browser`**) or implement the API route on the server. Pick one approach.

---

## Websites

| Service | URL | What you do there |
|---------|-----|-------------------|
| Google reCAPTCHA (v2) | [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) | Register your site, choose **v2** "I'm not a robot", add **localhost** and your production domain, copy **Site key** (and **Secret key** if verifying server-side). |
| EmailJS | [https://www.emailjs.com](https://www.emailjs.com) | Sign up, connect an **Email Service** (Gmail, Outlook, etc.), create an **Email Template** with fields matching your form, copy **Public Key**, **Service ID**, and **Template ID**. |

---

## Environment variables

**reCAPTCHA (site key in the browser):**

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
```

**Optional server verification** (only if your `/api/email/send` route checks the token with Google):

```bash
RECAPTCHA_SECRET_KEY=your_secret_key
```

Do **not** prefix the secret with `NEXT_PUBLIC_`.

Without **`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`**, the form shows an error state in development.

---

## EmailJS wiring

1. In the [EmailJS dashboard](https://dashboard.emailjs.com/), open **Account** > **General** for your **Public Key**.
2. Under **Email Services**, note the **Service ID** per connected provider.
3. Under **Email Templates**, create variables matching your form (e.g. `name`, `email`, `subject`, `message`) and note the **Template ID**.
4. In **`EmailSection.jsx`**, call **`emailjs.init(publicKey)`** and **`emailjs.send(serviceId, templateId, templateParams)`** after reCAPTCHA succeeds.

**Security:** Use EmailJS **allowed domains** / restrictions where available. Do not expose private keys in **`NEXT_PUBLIC_*`** variables.

---

## Optional server route

Implement **`src/app/api/email/send/route.js`** to send mail via EmailJS REST, Resend, SendGrid, etc. Validate input and verify reCAPTCHA on the server if you use **`RECAPTCHA_SECRET_KEY`**.

[Back to setup hub](/posts/guides/setup-hub)
