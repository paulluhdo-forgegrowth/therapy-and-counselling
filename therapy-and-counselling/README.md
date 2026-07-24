# Therapy & Counselling — Website

Static website for Kim van Zeeventer, Registered Counselling Psychologist (Edenvale & online).
Zero build step: semantic HTML, one shared stylesheet, vanilla JS, plus one Cloudflare Pages Function for the enquiry form.

## Project structure

```
therapy-and-counselling/
├── index.html            Homepage
├── about.html            About Kim
├── services.html         Services & Contact (enquiry form)
├── privacy.html          Privacy Policy
├── css/styles.css        Shared design system (all pages)
├── js/main.js            Vanilla JS (nav drawer, FAQ, reveal, form submit)
├── functions/
│   └── api/enquiry.js     Cloudflare Pages Function → POST /api/enquiry
└── assets/
    ├── logo/             Brand SVGs + favicon (referenced via <img>)
    ├── icons/            Inline SVG icon set
    └── images/           Optimised WebP photography
```

## Local preview

It's a static site, so open it with a small local server (needed so the pages can load `css/`, `js/` and `assets/`). Opening a bare `index.html` off the disk works for layout, but a server is closer to production:

```bash
# from the project folder
python3 -m http.server 8080      # then visit http://localhost:8080
```

The enquiry form's `POST /api/enquiry` only runs on Cloudflare (or `wrangler pages dev`); locally the form validates and shows its failure/alternatives message.

## Deploy to Cloudflare Pages

1. Push this folder to a Git repo (or upload directly in the Cloudflare dashboard).
2. Cloudflare Pages → **Create project** → connect the repo.
3. Build settings: **Framework preset:** None · **Build command:** *(leave empty)* · **Build output directory:** `/` (the repo root that contains `index.html`).
4. Deploy. The `functions/` folder is picked up automatically — no extra config.

## Form configuration (one step to go live)

The form posts to the `functions/api/enquiry.js` Pages Function, which delivers via [Resend](https://resend.com). Set these in **Pages → Settings → Variables and Secrets**:

| Name | Type | Value |
|---|---|---|
| `RESEND_API_KEY` | Secret | Your Resend API key |
| `ENQUIRY_TO` | Plain | Recipient inbox (default `therapyandcounselling4u@gmail.com`) |
| `ENQUIRY_FROM` | Plain | Verified sender, e.g. `Practice <hello@yourdomain.co.za>` |

Notes:
- Until a domain is verified in Resend, the function falls back to Resend's `onboarding@resend.dev` sender so it works immediately for testing. Use a verified domain sender for reliable production delivery.
- Optional: bind a KV namespace named `RATE_LIMIT` to enable basic per-IP throttling. If it isn't bound, the honeypot still filters most spam.
- No keys are ever exposed in client-side JavaScript.

## Domain setup

1. Cloudflare Pages → your project → **Custom domains** → add `therapyandcounselling.co.za` (and `www`).
2. Point DNS as Cloudflare instructs; SSL is issued automatically.
3. Update the production domain in each page's `<link rel="canonical">` and Open Graph URLs if the final domain differs from `https://www.therapyandcounselling.co.za/`.

See `FINAL-LAUNCH-CHECKLIST.md` for the remaining go-live items.
