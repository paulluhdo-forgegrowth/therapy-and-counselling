# Final Launch Checklist — Therapy & Counselling

Three lists: **A** what's done, **B** what needs the client to confirm, **C** what needs a deployment action. Nothing in B or C blocks the build being complete — they're go-live steps.

---

## A. Ready

- Four pages built and consistent: `index`, `about`, `services`, `privacy`.
- Shared design system; identical header, footer, buttons, cards, spacing, focus and reveal behaviour across pages.
- Homepage hero refined: balanced headline wrapping, dominant primary CTA, subtle registration badge, hero image is the LCP image (preloaded, not lazy-loaded).
- Responsive from 320px up: no horizontal scroll, 48px+ touch targets, icon-only logo on mobile, drawer opens/closes via button, overlay, Escape and link click, with background scroll locked and focus restored.
- Images: explicit width/height, intentional `object-position` (Kim's face prioritised), below-the-fold lazy-loaded, decorative assets use empty `alt`. The 365×365 workshop image is capped so it isn't upscaled.
- Fraunces headings + Geist body; Cormorant Garamond load removed (only Fraunces + Geist requested).
- Accessibility: one H1 per page, logical heading order, skip link, visible focus, labels tied to inputs, error messages tied to fields, `aria-current` on the active nav item, reduced-motion support, native `<details>` FAQ retained.
- Enquiry form: server-side + client-side validation, honeypot, disabled/`aria-busy` sending state, `aria-live` status, genuine success only on confirmed delivery, failure message with phone/email, entered data preserved on failure, privacy acknowledgement and "don't send medical details" note.
- Cloudflare Pages Function (`functions/api/enquiry.js`) built — no secrets in client JS.
- Metadata on all pages: unique titles/descriptions, canonical, Open Graph + Twitter, theme colour, favicon. Restrained JSON-LD on the homepage (no fabricated credentials).
- All internal links, tel/mailto/WhatsApp links audited; WhatsApp opens in a new tab with `rel="noopener noreferrer"`.
- Non-emergency notice present near contact points.

## B. Requires client confirmation (content — keep current verified content until confirmed)

- Exact professional title and HPCSA registration wording; practice number (only if it should be displayed).
- Phone number and whether WhatsApp is available on the same number.
- Email address, physical address and business hours.
- Career-timeline dates and qualifications (nursing background, 2009 Master's, 2010 registration, 2017–2020 Doha) — currently sourced from the existing site.
- Workshop availability, venues and any scheduled dates (the workshops block currently shows a neutral "enquire" message).
- Emergency / crisis wording and the correct local crisis resources.
- Privacy Policy items marked `[confirm]`: email-delivery provider, data-retention period, whether analytics is added, and the "last updated" date on publication.
- A higher-resolution workshop photograph (current is 365×365 and capped to avoid upscaling).
- Social-share image(s): `assets/images/og-home.webp`, `og-about.webp`, `og-services.webp` (1200×630). One branded image may be reused for all until per-page versions exist.
- Optional "Website by Forge Digital" footer credit (only if approved).

## C. Requires deployment action

- Create the repo / upload to Cloudflare Pages (build command empty, output directory = project root).
- Add form delivery variables in Pages → Settings: `RESEND_API_KEY` (secret), `ENQUIRY_TO`, and a verified `ENQUIRY_FROM` sender.
- (Optional) Bind a `RATE_LIMIT` KV namespace for throttling.
- Send one live test enquiry and confirm it arrives at the practice inbox.
- Connect the custom domain and confirm SSL is active.
- Confirm the production domain matches the canonical / Open Graph URLs in each page (update if different).
- Supply and add the Open Graph image file(s) referenced in the metadata.
