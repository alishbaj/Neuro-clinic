# Neuro Longevity Care — website source

**Live site:** https://alishbaj.github.io/Neuro-clinic/

Plain static HTML/CSS. No build step, no framework. Every push to `main`
publishes to GitHub Pages via `.github/workflows/publish.yml`.

## Run locally
```sh
./serve.sh      # macOS / Linux   (serve.bat on Windows)
```
Open http://localhost:8000.

## Set the Elation links (the one file to edit after EHR onboarding)
`config.js` holds the self-scheduling, bill-pay, forms and patient-portal
URLs plus phone/email. Paste the links from Elation there; every
"Book a Consultation", "Pay a Bill", "Complete Forms" and "Patient Portal"
button across the site picks them up. Empty values fall back to the
Contact page, so nothing is ever a broken link.

## Files
- `*.html` — one file per page (home, neurology, second-opinions,
  headache-migraine, stroke-prevention, brain-health, executive-brain-health,
  family-care-navigation, professional-services, brain-mri, about, resources,
  checklist, pricing, contact, legal, 404).
- `assets/site.css` — all styles. `assets/site.js` — nav, link wiring, hero.
- `assets/sunrise-loop.html` — hero animation (home only, loads after the page).
- `sitemap.xml`, `robots.txt` — update the base URL in both (and the
  `<link rel="canonical">` tags) when the practice gets its own domain.

## Before launch (search for `TODO` in the HTML)
- Fees on `pricing.html` (each "Fee published before launch" badge).
- Phone/email in `config.js`.
- Attorney-approved text on `legal.html`, the family-navigation scope note,
  the Medicare and cancellation answers on `pricing.html`.
- Publications / appointments on `about.html`, if any.
