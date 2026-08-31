# Longevity Neurology Center — website

A static rebuild of [longevityneurologycenter.com](https://www.longevityneurologycenter.com) — the
concierge preventive-neurology practice of Dr. Tasha Powell, MD, in Scottsdale, Arizona.

The original site is a Wix build. This is a hand-written, dependency-free static site: no framework,
no bundler, no runtime JavaScript library. It deploys to GitHub Pages (or any static host) as-is.

---

## Quick start

```bash
python3 build.py                 # regenerate the HTML from src/
python3 -m http.server 8000      # then open http://localhost:8000
python3 tools/check.py           # verify links, assets and ARIA wiring
```

`build.py` needs nothing beyond the Python 3 standard library.

---

## How the project is laid out

```
build.py                 site generator — shell, nav, footer, SEO, blog index
tools/check.py           link / asset / a11y-wiring checker
src/pages/*.html         page bodies (markup only, no <head>, no chrome)
src/pages/*.body.html    blog article bodies
assets/css/styles.css    the entire design system
assets/js/main.js        all site behaviour
assets/img/              optimized WebP + JPEG derivatives
*.html                   generated output — edit src/, not these
sitemap.xml robots.txt site.webmanifest   generated
```

**Every page shares one shell**, defined in `build.py`. Header, navigation, drawer, footer, JSON-LD
and the meta tags are written once, so they cannot drift apart across 18 pages. Page bodies are plain
markup with three tokens the builder resolves:

| Token | Expands to |
|---|---|
| `{{icon:name}}` or `{{icon:name\|class}}` | an inline SVG `<use>` referencing the page's icon sprite |
| `{{img:name\|alt\|class\|sizes\|loading}}` | a `<picture>` with a WebP srcset, JPEG fallback and intrinsic `width`/`height` |
| `{{site.key}}` | a value from the `SITE` dict (phone, email, address, booking URL…) |
| `{{post_cards}}` / `{{post_cards:3}}` | the blog card grid, generated from the `POSTS` list |

To change the address, phone number or booking link, edit `SITE` in `build.py` and rebuild — it
updates everywhere, including the structured data.

---

## Pages

| Page | Source |
|---|---|
| Home | `src/pages/index.html` |
| About the Center | `src/pages/about-longevityneurologycenter.html` |
| Our Philosophy of Care | `src/pages/longevity-neurology-center.html` |
| Dr. Tasha Powell | `src/pages/dr-tasha-powell.html` |
| Services | `src/pages/services.html` |
| Patient Resources | `src/pages/patient-resources.html` |
| Blog index | `src/pages/blog.html` |
| Contact | `src/pages/contact.html` |
| Privacy / Terms / SMS Opt-In | `src/pages/{privacy-policy,terms-and-conditions,sms-opt-in-policy}.html` |
| 404 | `src/pages/404.html` |
| 6 blog articles | `src/pages/<slug>.body.html` + the `POSTS` list in `build.py` |

---

## Design system

Taken from the live site's own theme rather than invented:

| Token | Value | Role |
|---|---|---|
| `--ink` | `#221153` | brand indigo — headings, header, footer |
| `--gold` | `#B39244` | accent rules, icon wells, primary CTA |
| `--gold-text` | `#8A6E28` | the same gold darkened to clear 4.5:1 on white |
| `--bg-cream` | `#FAF7F1` | warm section band |

Typography substitutes the site's licensed Wix faces with the closest Google Fonts:
**Montserrat** for the tracked uppercase display (for Lulo Clean), **Caudex** for serif statements
(the original face, also on Google Fonts), and **Barlow** for body copy (for DIN Next).

The site is deliberately light-mode only, matching the brand. `color-scheme: light` is set explicitly
so the browser does not apply its own dark treatment to form controls.

---

## Features implemented

**Navigation** — sticky header that elevates on scroll, desktop dropdown driven by hover, click,
`ArrowDown` and `Escape`, an off-canvas mobile drawer with a focus trap and scroll lock, a persistent
Call / Visit / Book bar on phones, breadcrumbs, and automatic `aria-current` on the active page.

**Content components** — full-bleed hero with animated scroll cue, feature and condition card grids,
a numbered treatment-process timeline, an animated stat counter, a single-open FAQ accordion, a
testimonial carousel (autoplay, pause on hover/focus/tab-away, arrows, dots, arrow keys, touch swipe,
live-region announcements), blog cards with a full-card hit area, a comparison table, and a lazy-loaded
Google Map.

**Contact form** — inline validation on blur and on input, an error summary, `aria-invalid`, focus sent
to the first bad field, and a loading state. There is no backend on a static host, so a validated
submission opens a prefilled mail draft to the practice rather than silently discarding the message.

**Accessibility** — skip link, visible 3px focus rings everywhere, ≥44px touch targets, labelled icon
buttons, `alt` text on every image, `inert` on collapsed panels and the closed drawer so their links
leave the tab order, and `prefers-reduced-motion` honoured throughout.

**Performance** — WebP with JPEG fallback and `srcset`/`sizes`, intrinsic `width`/`height` on every
image so nothing shifts as it loads, an eager high-priority hero and lazy everything else, an inline
SVG sprite instead of an icon font, scroll handlers throttled through `requestAnimationFrame`, and a
deferred 9KB script that is the only JavaScript on the page.

**Fail-safe by design** — the page renders completely with JavaScript disabled. The scroll-reveal
start state is applied by an inline head guard only after confirming `IntersectionObserver` and no
reduced-motion preference, so a script failure can never leave a section blank.

**SEO** — per-page title, description, canonical, Open Graph and Twitter tags, `MedicalClinic`
structured data on every page, `FAQPage` on the home page, `BlogPosting` on each article, plus a
generated `sitemap.xml`, `robots.txt` and web manifest.

---

## Verification

`tools/check.py` parses every generated page and fails the build on any of:

- an internal link, `#anchor`, or cross-page fragment that does not resolve
- a missing `src` / `srcset` / stylesheet asset
- `aria-controls`, `aria-labelledby`, `aria-describedby` or `label[for]` pointing at a missing id
- a `<use href="#i-…">` with no matching sprite symbol
- duplicate ids, unbalanced tags, a missing `<h1>`
- an image without `alt` or without intrinsic dimensions

Current status: **24 pages, 687 internal links, 471 asset references — no problems.**

Behaviour was additionally exercised in headless Chrome across the drawer, dropdown, accordion,
carousel, counters, lazy map, back-to-top and form validation, and every page was checked for
horizontal overflow at 375px, 768px and 1280px.

---

## Deploying

Live at **<https://alishbaj.github.io/Neuro-clinic/>**

Pages is configured as *Settings → Pages → Source → Deploy from a branch → `gh-pages` / (root)*, so
the branch `gh-pages` holds the built site and `main` holds the source.

Pushing to `main` runs `.github/workflows/publish.yml`, which rebuilds from `src/`, runs
`tools/check.py` and force-pushes the result to `gh-pages` — a broken link fails before publishing.
That workflow needs *Settings → Actions → General → Workflow permissions* set to
**Read and write permissions**.

If it cannot push, publish from a machine with write access instead:

```bash
./tools/publish.sh
```

---

## Content note

Copy, imagery and clinic details are the property of Longevity Neurology Center and were taken from
the practice's own live site. `SITE` in `build.py` is the single place to correct any detail.
