#!/usr/bin/env python3
"""
Static site builder for Texas Neurology Consultants (Alla Al-Habib, M.D.).

Every page shares one shell (head, skip link, top bar, header, drawer, footer,
back-to-top, mobile action bar) so navigation and metadata can never drift
between pages. Page bodies live in src/pages/*.html and are pure markup.

    python3 build.py          # writes the HTML files to the repo root
"""

from __future__ import annotations

import html
import json
import pathlib
import re
import sys
from datetime import date

ROOT = pathlib.Path(__file__).parent.resolve()
SRC = ROOT / "src"
PAGES_DIR = SRC / "pages"

# --------------------------------------------------------------------- site
SITE = {
    "name": "Texas Neurology Consultants",
    "short": "Texas Neurology Consultants",
    "legal": "Texas Neurology Consultants, PLLC",
    "doctor": "Alla Al-Habib, M.D.",
    "doctor_short": "Dr. Al-Habib",
    "tagline": "Compassionate Care from Day One",
    "origin": "https://texasneurologyconsultants.com",
    "phone": "(972) 403-3100",
    "phone_href": "+19724033100",
    "fax": "(972) 403-3105",
    "street": "6124 West Parker Road, Suite 432",
    "building": "Medical Office Building 3",
    "city": "Plano",
    "state": "TX",
    "zip": "75093",
    "booking": "https://texasneurologyconsultants.com/book-an-appointment/",
    "portal": "https://mycw27.eclinicalweb.com/portal2567/jsp/100mp/login_otp.jsp",
    "maps_embed": (
        "https://www.google.com/maps?q=6124+West+Parker+Road+Suite+432,"
        "+Plano,+TX+75093&output=embed"
    ),
    "maps_link": (
        "https://www.google.com/maps/search/?api=1&query="
        "6124+West+Parker+Road+Suite+432%2C+Plano%2C+TX+75093"
    ),
    # The practice publishes no email address or social accounts — patients reach
    # us by phone, through the patient portal, or in person. Nothing is invented here.
    "socials": [],
}
SITE["address_1line"] = f'{SITE["street"]}, {SITE["city"]} {SITE["state"]} {SITE["zip"]}'

HOURS = [
    ("Monday \u2013 Thursday", "8:00 AM \u2013 4:30 PM"),
    ("Friday", "8:00 AM \u2013 12:00 PM"),
    ("Saturday & Sunday", "Closed"),
]
HOURS_NOTE = ("The office closes for lunch from 12:00 PM to 1:00 PM. "
              "Not all physicians are in the office on Fridays.")

# ------------------------------------------------------------------ icon set
# Lucide-style 24×24 stroke icons + Simple-Icons brand glyphs. No emoji anywhere.
STROKE_ICONS = {
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    "printer": '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    "calendar": '<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "arrow-up": '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "x": '<path d="M18 6 6 18M6 6l12 12"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "check-circle": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "alert-circle": '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    "info": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
    "brain": '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>',
    "heart-pulse": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    "leaf": '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    "syringe": '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "graduation-cap": '<path d="M22 10v6M2 10l10-5 10 5-10 5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    "activity": '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    "scale": '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    "droplet": '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z"/>',
    "clipboard-list": '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    "target": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "sparkles": '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    "credit-card": '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    "stethoscope": '<path d="M4 2v6a5 5 0 0 0 10 0V2"/><path d="M4 2H2M14 2h2"/><path d="M9 13v3a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2"/>',
    "moon": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    "compass": '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    "hand-heart": '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.7 2.7 0 0 0 16 4a2.7 2.7 0 0 0-5 1.8c0 1.1.8 2 1.5 2.7L16 12Z"/>',
    "microscope": '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z"/><path d="M12 6h2"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
}
FILL_ICONS = {
    "star": '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>',
    "quote": '<path d="M9.5 5C6 5 3 8 3 11.5V19h7.5v-7.5H7C7 9.6 8.3 8.2 10.2 8V5Zm11 0C17 5 14 8 14 11.5V19h7.5v-7.5H18c0-1.9 1.3-3.3 3.2-3.5V5Z"/>',
    "facebook": '<path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>',
    "instagram": '<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06L12 2.16Zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.846-10.405a1.441 1.441 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"/>',
    "linkedin": '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/>',
    "youtube": '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/>',
    "tiktok": '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z"/>',
}


def sprite() -> str:
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true"><defs>']
    for name, body in STROKE_ICONS.items():
        parts.append(
            f'<symbol id="i-{name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">{body}</symbol>'
        )
    for name, body in FILL_ICONS.items():
        parts.append(f'<symbol id="i-{name}" viewBox="0 0 24 24" fill="currentColor">{body}</symbol>')
    parts.append("</defs></svg>")
    return "".join(parts)


def icon(name: str, cls: str = "") -> str:
    c = f' class="{cls}"' if cls else ""
    return f'<svg{c} aria-hidden="true" focusable="false"><use href="#i-{name}"></use></svg>'


# ------------------------------------------------------------------- images
IMG_DIR = ROOT / "assets" / "img"
_DIM_CACHE: dict[str, tuple[int, int]] = {}

_SOF = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}


def dimensions(path: pathlib.Path) -> tuple[int, int]:
    """Read intrinsic pixel size from a JPEG or PNG header — no third-party deps."""
    key = str(path)
    if key in _DIM_CACHE:
        return _DIM_CACHE[key]
    data = path.read_bytes()
    size = (0, 0)
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        size = (int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big"))
    elif data[:2] == b"\xff\xd8":
        i = 2
        while i < len(data) - 9:
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in _SOF:
                size = (int.from_bytes(data[i + 7:i + 9], "big"), int.from_bytes(data[i + 5:i + 7], "big"))
                break
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            i += 2 + int.from_bytes(data[i + 2:i + 4], "big")
    if size == (0, 0):
        raise ValueError(f"Could not read dimensions for {path}")
    _DIM_CACHE[key] = size
    return size


def img(name: str, alt: str, cls: str = "", sizes: str = "100vw", loading: str = "lazy") -> str:
    """<picture> with a WebP srcset, a JPEG fallback and intrinsic width/height."""
    jpg = IMG_DIR / f"{name}.jpg"
    if not jpg.exists():
        raise FileNotFoundError(f"assets/img/{name}.jpg is missing")
    w, h = dimensions(jpg)

    widths = []
    for p in IMG_DIR.glob(f"{name}-*.webp"):
        head, _, tail = p.stem.rpartition("-")
        if head == name and tail.isdigit():
            widths.append(int(tail))
    widths.sort()

    srcset = ", ".join(f"assets/img/{name}-{v}.webp {v}w" for v in widths)
    eager = loading == "eager"
    attrs = ' loading="eager" fetchpriority="high" decoding="async"' if eager else ' loading="lazy" decoding="async"'
    klass = f' class="{cls}"' if cls else ""
    source = f'<source type="image/webp" srcset="{srcset}" sizes="{sizes}">' if srcset else ""
    return (
        f"<picture>{source}"
        f'<img src="assets/img/{name}.jpg" width="{w}" height="{h}" alt="{html.escape(alt, quote=True)}"'
        f"{klass}{attrs}></picture>"
    )


# ------------------------------------------------------------------ nav model
NAV = [
    {"label": "Home", "href": "index.html"},
    {
        "label": "About",
        "href": "about-texas-neurology-consultants.html",
        "children": [
            ("About the Practice", "about-texas-neurology-consultants.html"),
            ("Our Approach to Care", "approach-to-care.html"),
            ("Alla Al-Habib, M.D.", "dr-alla-al-habib.html"),
        ],
    },
    {"label": "Services", "href": "services.html"},
    {"label": "Patient Resources", "href": "patient-resources.html"},
    {"label": "Blog", "href": "blog.html"},
    {"label": "Contact", "href": "contact.html"},
]


def desktop_nav() -> str:
    out = ['<ul class="nav__list">']
    for i, item in enumerate(NAV):
        if "children" in item:
            mid = f"submenu-{i}"
            out.append('<li class="nav__item nav__item--has-menu">')
            out.append(
                f'<button type="button" class="nav__link" aria-expanded="false" aria-controls="{mid}">'
                f'{item["label"]}{icon("chevron-down")}</button>'
            )
            out.append(f'<ul class="nav__submenu" id="{mid}">')
            for label, href in item["children"]:
                out.append(f'<li><a href="{href}">{label}</a></li>')
            out.append("</ul></li>")
        else:
            out.append(f'<li class="nav__item"><a class="nav__link" href="{item["href"]}">{item["label"]}</a></li>')
    out.append("</ul>")
    return "".join(out)


def drawer_nav() -> str:
    out = ['<ul class="drawer__nav">']
    for i, item in enumerate(NAV):
        if "children" in item:
            pid = f"drawer-sub-{i}"
            out.append("<li>")
            out.append(
                f'<button type="button" class="drawer__toggle" data-toggle="disclosure" '
                f'aria-expanded="false" aria-controls="{pid}">{item["label"]}{icon("chevron-down")}</button>'
            )
            out.append(f'<div class="drawer__sub" id="{pid}" aria-hidden="true"><div><ul>')
            for label, href in item["children"]:
                out.append(f'<li><a href="{href}">{label}</a></li>')
            out.append("</ul></div></div></li>")
        else:
            out.append(f'<li><a href="{item["href"]}">{item["label"]}</a></li>')
    out.append("</ul>")
    return "".join(out)


def social_links(cls: str) -> str:
    return "".join(
        f'<a href="{url}" target="_blank" rel="noopener noreferrer" aria-label="{name} '
        f'(opens in a new tab)">{icon(slug)}</a>'
        for name, slug, url in SITE["socials"]
    )


# --------------------------------------------------------------- shell parts
def topbar() -> str:
    return f"""
<div class="topbar">
  <div class="container topbar__inner">
    <div class="topbar__group">
      <a href="tel:{SITE['phone_href']}">{icon('phone')}<span>Tel: {SITE['phone']}</span></a>
      <span class="topbar__hide-sm" style="opacity:.75">{icon('printer')}<span>Fax: {SITE['fax']}</span></span>
    </div>
    <div class="topbar__group">
      <span class="topbar__hide-sm" style="opacity:.75">{SITE['city']}, Texas &middot; {SITE['building']}</span>
      <a href="{SITE['portal']}" target="_blank" rel="noopener noreferrer">{icon('external-link')}<span>Patient Portal</span></a>
    </div>
  </div>
</div>"""


def header() -> str:
    return f"""
<header class="site-header">
  <nav class="container nav" data-nav aria-label="Primary">
    <a class="brand" href="index.html" aria-label="{SITE['name']} — home">
      <!-- 780x160 source shown at ~253px wide, so 1x already exceeds 1.5x density. -->
      <img src="assets/img/logo-wordmark-dark.png" width="780" height="160" alt="{SITE['name']}">
    </a>
    {desktop_nav()}
    <div class="nav__cta">
      <a class="btn btn--sm" href="{SITE['booking']}" target="_blank" rel="noopener noreferrer">
        {icon('calendar')}Book Appointment
      </a>
      <button type="button" class="burger" aria-expanded="false" aria-controls="site-drawer" aria-label="Open menu">
        <span class="burger__box"><span></span><span></span><span></span></span>
      </button>
    </div>
  </nav>
</header>

<div class="drawer-scrim"></div>
<div class="drawer" id="site-drawer" role="dialog" aria-modal="true" aria-label="Site menu" data-nav>
  <div class="drawer__head">
    <img src="assets/img/logo-wordmark-dark.png" width="780" height="160" alt="{SITE['name']}">
    <button type="button" class="drawer__close" data-drawer-close aria-label="Close menu">{icon('x')}</button>
  </div>
  <div class="drawer__body">
    {drawer_nav()}
  </div>
  <div class="drawer__foot">
    <a class="btn btn--block" href="{SITE['booking']}" target="_blank" rel="noopener noreferrer">
      {icon('calendar')}Book Appointment
    </a>
    <p class="drawer__contact">
      <a href="tel:{SITE['phone_href']}">{SITE['phone']}</a><br>
      <a href="{SITE['portal']}" target="_blank" rel="noopener noreferrer">Patient Portal</a>
    </p>
  </div>
</div>"""


def footer() -> str:
    hours = "".join(
        f'<li><span class="day">{d}</span><span>{h}</span></li>' for d, h in HOURS
    )
    menu = "".join(
        f'<li><a href="{href}">{label}</a></li>'
        for label, href in [
            ("Home", "index.html"),
            ("About the Practice", "about-texas-neurology-consultants.html"),
            ("Our Approach to Care", "approach-to-care.html"),
            ("Alla Al-Habib, M.D.", "dr-alla-al-habib.html"),
            ("Services", "services.html"),
            ("Patient Resources", "patient-resources.html"),
            ("Blog", "blog.html"),
            ("Contact", "contact.html"),
        ]
    )
    return f"""
<footer class="site-footer">
  <div class="container footer__top">
    <div class="footer__brand">
      <img src="assets/img/logo-wordmark.png" width="780" height="160" alt="{SITE['name']}">
      <p>A physician-owned, independent neurology practice in Plano, Texas. Dr. Alla Al-Habib is a
         triple board-certified neurologist caring for patients across North Dallas and the wider
         DFW area.</p>
    </div>

    <div>
      <h2 class="footer__title">Office Hours</h2>
      <ul class="hours">{hours}</ul>
      <p style="margin-top:1rem;font-size:var(--f-xs);opacity:.8">{HOURS_NOTE}</p>
    </div>

    <div>
      <h2 class="footer__title">Menu</h2>
      <ul class="footer__list">{menu}</ul>
    </div>

    <div>
      <h2 class="footer__title">Contact Us</h2>
      <ul class="footer__list">
        <li><a href="{SITE['maps_link']}" target="_blank" rel="noopener noreferrer">
            {SITE['street']}<br>{SITE['building']}<br>{SITE['city']}, {SITE['state']} {SITE['zip']}</a></li>
        <li><a href="tel:{SITE['phone_href']}">Tel: {SITE['phone']}</a></li>
        <li>Fax: {SITE['fax']}</li>
        <li><a href="{SITE['portal']}" target="_blank" rel="noopener noreferrer">Patient Portal</a></li>
      </ul>
      <p style="margin-top:1.25rem">
        <a class="btn btn--gold btn--sm" href="{SITE['booking']}" target="_blank" rel="noopener noreferrer">
          Book Appointment
        </a>
      </p>
    </div>
  </div>

  <div class="container">
    <p class="footer__disclaimer">
      The content on this website is for general educational purposes only and is not medical advice,
      nor does it create a doctor–patient relationship. Always seek the advice of your physician with
      any questions about a medical condition. If you are experiencing a medical emergency, call 911 or
      go to the nearest emergency room.
    </p>
  </div>

  <div class="container footer__bottom">
    <p style="margin:0">&copy; <span data-year>2025</span> {SITE['legal']}. All Rights Reserved.</p>
    <ul class="footer__legal">
      <li><a href="terms-and-conditions.html">Terms &amp; Conditions</a></li>
      <li><a href="privacy-policy.html">Privacy Policy</a></li>
      <li><a href="sms-opt-in-policy.html">SMS Opt-In Policy</a></li>
    </ul>
  </div>
</footer>

<button type="button" class="to-top" aria-label="Back to top">{icon('arrow-up')}</button>

<nav class="mobile-bar" aria-label="Quick actions">
  <a href="tel:{SITE['phone_href']}">{icon('phone')}<span>Call</span></a>
  <a href="contact.html">{icon('map-pin')}<span>Visit</span></a>
  <a class="is-primary" href="{SITE['booking']}" target="_blank" rel="noopener noreferrer">{icon('calendar')}<span>Book</span></a>
</nav>"""


# ------------------------------------------------------------------ JSON-LD
def structured_data(page) -> str:
    business = {
        "@context": "https://schema.org",
        "@type": "MedicalClinic",
        "name": SITE["name"],
        "url": SITE["origin"] + "/",
        "logo": SITE["origin"] + "/assets/img/logo-wordmark.png",
        "image": SITE["origin"] + "/assets/img/waiting-room.jpg",
        "description": "Physician-owned neurology practice in Plano, Texas. Alla Al-Habib, M.D. is a "
                       "triple board-certified neurologist with special interest in stroke and headache medicine.",
        "telephone": SITE["phone"],
        "faxNumber": SITE["fax"],
        "medicalSpecialty": "Neurologic",
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": f'{SITE["street"]}, {SITE["building"]}',
            "addressLocality": SITE["city"],
            "addressRegion": SITE["state"],
            "postalCode": SITE["zip"],
            "addressCountry": "US",
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
                "opens": "08:00",
                "closes": "16:30",
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Friday"],
                "opens": "08:00",
                "closes": "12:00",
            },
        ],
        "employee": {
            "@type": "Physician",
            "name": "Alla Al-Habib, M.D.",
            "jobTitle": "Board Certified Neurologist",
            "medicalSpecialty": "Neurologic",
            "alumniOf": [
                {"@type": "EducationalOrganization", "name": "Jordan University of Science and Technology"},
                {"@type": "EducationalOrganization", "name": "Baylor College of Medicine"},
                {"@type": "EducationalOrganization", "name": "Washington University in St. Louis"},
            ],
        },
    }
    if SITE["socials"]:
        business["sameAs"] = [url for _, _, url in SITE["socials"]]
    blocks = [business]
    if page.get("post"):
        p = POST_BY_SLUG[page["post"]]
        blocks.append(
            {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": p["title"],
                "description": re.sub(r"\s+", " ", p["excerpt"]),
                "image": f'{SITE["origin"]}/assets/img/{p["img"]}.jpg',
                "datePublished": p["iso"],
                "dateModified": p["iso"],
                "author": {"@type": "Person", "name": "Alla Al-Habib, M.D."},
                "publisher": {"@type": "Organization", "name": SITE["name"]},
                "mainEntityOfPage": SITE["origin"] + "/post/" + p["slug"],
            }
        )
    if page.get("faq"):
        blocks.append(
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a},
                    }
                    for q, a in page["faq"]
                ],
            }
        )
    return "".join(
        f'<script type="application/ld+json">{json.dumps(b, separators=(",", ":"))}</script>' for b in blocks
    )


# ------------------------------------------------------------------- layout
LAYOUT = """<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#1d3a72">
<meta name="robots" content="index, follow">

<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{site_name}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og_image}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="{og_image}">

<link rel="icon" href="favicon.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style"
      href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&family=Caudex:ital@0;1&family=Montserrat:wght@600;700&display=swap">
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&family=Caudex:ital@0;1&family=Montserrat:wght@600;700&display=swap">
<link rel="stylesheet" href="assets/css/styles.css">
<script>
/* Opt in to scroll-reveal only when we can actually drive it. */
(function (d) {{
  d.className = d.className.replace(/\bno-js\b/, '');
  try {{
    if ('IntersectionObserver' in window &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {{
      d.className += ' js-reveal';
    }}
  }} catch (e) {{}}
}})(document.documentElement);
</script>
{head_extra}
{jsonld}
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
{sprite}
{topbar}
{header}

<main id="main">
{body}
</main>

{footer}
<script src="assets/js/main.js" defer></script>
</body>
</html>
"""


# -------------------------------------------------------------------- pages
PAGES = [
    {
        "slug": "index",
        "path": "/",
        "title": "Alla Al-Habib, M.D. | Board Certified Neurologist in Plano, TX",
        "description": "Alla Al-Habib, M.D. is a triple board-certified neurologist at Texas Neurology "
                       "Consultants in Plano, Texas, with special interest in stroke and headache medicine.",
        "og_image": "waiting-room.jpg",
        "faq": [
            ("Do I need a referral to see Dr. Al-Habib?",
             "It depends on your insurance plan. Some plans require a referral from your primary care "
             "physician before a neurology visit; others do not. Please check with your plan before you "
             "schedule, and call our office at (972) 403-3100 if you are unsure."),
            ("What insurance do you accept?",
             "We accept most major insurance plans, including Medicare. We do not accept Medicaid or "
             "Medicare/Medicaid replacement plans. Please call the office to confirm that we are in "
             "network with your specific plan before your appointment."),
            ("What should I bring to my first appointment?",
             "Bring a government-issued photo ID, your insurance and pharmacy benefit cards, a referral "
             "authorization if your plan requires one, a complete list of your medications with strength, "
             "dose and frequency, any recent lab results or imaging reports, and a medical power of "
             "attorney if one applies. If your registration packet is not finished in advance, please "
             "arrive 30 to 45 minutes early."),
            ("Which conditions does Dr. Al-Habib treat?",
             "Dr. Al-Habib provides general adult neurology care, including stroke and cerebrovascular "
             "disease, headaches and migraines, epilepsy and seizure disorders, neuropathy, memory "
             "concerns, Parkinson's disease, tremor and other movement disorders, multiple sclerosis and "
             "carpal tunnel syndrome. She is triple board certified, with a special interest in stroke "
             "and headache medicine."),
            ("Is diagnostic testing done in the office?",
             "Yes. We perform EEG, ambulatory EEG, EMG/nerve conduction studies, sleep studies and "
             "NeuroTrax cognitive testing. Imaging such as MRI or CT is arranged at an outside facility "
             "and billed to your insurance by that facility."),
        ],
    },
    {
        "slug": "about-texas-neurology-consultants",
        "path": "/about-texas-neurology-consultants",
        "title": "About Texas Neurology Consultants | Neurology Practice in Plano, TX",
        "description": "A physician-owned, independent neurology practice serving DFW since 2003 \u2014 "
                       "diagnosis and treatment of disorders of the brain, spinal cord, nerves and muscles.",
        "og_image": "waiting-room.jpg",
    },
    {
        "slug": "approach-to-care",
        "path": "/approach-to-care",
        "title": "Our Approach to Care | Texas Neurology Consultants, Plano TX",
        "description": "Careful history, a thorough neurological exam and the right test at the right "
                       "time \u2014 how Dr. Alla Al-Habib approaches a new neurology consultation.",
        "og_image": "consult-couple.jpg",
    },
    {
        "slug": "dr-alla-al-habib",
        "path": "/dr-alla-al-habib",
        "title": "Alla Al-Habib, M.D. | Triple Board Certified Neurologist, Plano TX",
        "description": "Meet Alla Al-Habib, M.D. \u2014 board certified in neurology and vascular/stroke "
                       "neurology, UCNS certified in headache medicine, trained at Baylor and WashU.",
        "og_image": "dr-alhabib-portrait.jpg",
    },
    {
        "slug": "services",
        "path": "/services",
        "title": "Neurology Services & Diagnostics | Texas Neurology Consultants, Plano TX",
        "description": "Stroke, headache and migraine, epilepsy, neuropathy, memory, movement disorders "
                       "and MS \u2014 plus in-office EEG, EMG/NCS, sleep studies and cognitive testing.",
        "og_image": "neuro-exam.jpg",
    },
    {
        "slug": "patient-resources",
        "path": "/patient-resources",
        "title": "Patient Resources | Texas Neurology Consultants, Plano TX",
        "description": "New patient forms, what to bring to your first visit, insurance and billing, "
                       "medical records requests and the patient portal.",
        "og_image": "waiting-room.jpg",
    },
    {
        "slug": "blog",
        "path": "/blog",
        "title": "Neurology Blog | Texas Neurology Consultants",
        "description": "Plain-language neurology education from Dr. Alla Al-Habib \u2014 stroke, headache, "
                       "memory and the conditions we see most often in clinic.",
        "og_image": "blog-skip.jpg",
    },
    {
        "slug": "contact",
        "path": "/contact",
        "title": "Contact Texas Neurology Consultants | Plano, TX Neurologist",
        "description": "Call (972) 403-3100 or visit us at 6124 West Parker Road, Suite 432, Medical "
                       "Office Building 3, Plano TX 75093. Fax (972) 403-3105.",
        "og_image": "office.jpg",
    },
    {
        "slug": "privacy-policy",
        "path": "/privacy-policy",
        "title": "Privacy Policy | Texas Neurology Consultants",
        "description": "How Texas Neurology Consultants collects, uses and protects the information you "
                       "share with us.",
        "og_image": "office.jpg",
        "robots": "noindex, follow",
    },
    {
        "slug": "terms-and-conditions",
        "path": "/terms-and-conditions",
        "title": "Terms & Conditions | Texas Neurology Consultants",
        "description": "The terms that govern your use of the Texas Neurology Consultants website.",
        "og_image": "office.jpg",
        "robots": "noindex, follow",
    },
    {
        "slug": "sms-opt-in-policy",
        "path": "/sms-opt-in-policy",
        "title": "SMS Opt-In Policy | Texas Neurology Consultants",
        "description": "How our appointment text messaging works: consent, message frequency, rates, and "
                       "how to opt out.",
        "og_image": "office.jpg",
        "robots": "noindex, follow",
    },
    {
        "slug": "404",
        "path": "/404",
        "title": "Page Not Found | Texas Neurology Consultants",
        "description": "That page could not be found. Explore our services, meet Dr. Al-Habib, or get in touch.",
        "og_image": "office.jpg",
        "robots": "noindex, nofollow",
    },
]


# --------------------------------------------------------------- blog posts
POSTS = [
    {
        "slug": "the-fastest-brain-health-hack-what-a-neurologist-wants-you-to-know",
        "title": "The Fastest Brain Health Hack: What a Neurologist Wants You to Know",
        "date": "14 August 2026", "iso": "2026-08-14", "read": "5 min read",
        "topic": "Brain Health",
        "img": "blog-skip", "alt": "Two women celebrating together after exercising",
        "excerpt": "Most of my patients over 60 can\u2019t skip. Not won\u2019t \u2014 can\u2019t. That single test tells me "
                   "more about brain health than almost any other quick screen I can do in an exam room.",
    },
    {
        "slug": "up-to-70-of-dementia-is-preventable-the-8-things-that-matter-most-for-your-brain",
        "title": "Up to 70% of Dementia Is Preventable \u2014 The 8 Things That Matter Most for Your Brain",
        "date": "9 July 2026", "iso": "2026-07-09", "read": "8 min read", "updated": "14 August 2026",
        "topic": "Prevention",
        "img": "consult-desk", "alt": "A neurologist reviewing dementia risk factors with two patients",
        "excerpt": "Research suggests that between 45 and 70% of dementia cases could be prevented at the "
                   "population level through modification of eight key lifestyle and health factors.",
    },
    {
        "slug": "recognizing-a-stroke-be-fast-and-why-every-minute-counts",
        "title": "Recognizing a Stroke: BE FAST, and Why Every Minute Counts",
        "date": "23 June 2026", "iso": "2026-06-23", "read": "6 min read",
        "topic": "Stroke",
        "img": "consult-exam", "alt": "A neurologist performing a bedside neurological examination",
        "excerpt": "An untreated large-vessel stroke destroys roughly 1.9 million neurons a minute. "
                   "Knowing the six warning signs \u2014 and calling 911 instead of driving \u2014 changes outcomes.",
    },
    {
        "slug": "5-rare-neurological-conditions-that-sound-fictional-but-are-very-real",
        "title": "5 Rare Neurological Conditions That Sound Fictional \u2014 But Are Very Real",
        "date": "14 May 2026", "iso": "2026-05-14", "read": "6 min read", "updated": "18 May 2026",
        "topic": "Conditions",
        "img": "clinician-tablet", "alt": "A clinician reviewing a patient\u2019s notes on a tablet",
        "excerpt": "In neurology, the word \u201cinteresting\u201d isn\u2019t a compliment. It usually means rare, complex "
                   "\u2014 and difficult to treat. Five real conditions that sound like fiction.",
    },
    {
        "slug": "migraine-or-tension-headache-how-a-specialist-tells-the-difference",
        "title": "Migraine or Tension Headache? How a Specialist Tells the Difference",
        "date": "9 April 2026", "iso": "2026-04-09", "read": "5 min read",
        "topic": "Headache",
        "img": "burnout-laptop", "alt": "A person pinching the bridge of their nose at a laptop",
        "excerpt": "\u201cJust a bad headache\u201d is the phrase I hear most often from people who turn out to have "
                   "migraine. The distinction is not academic \u2014 it changes the entire treatment plan.",
    },
    {
        "slug": "a-neurologist-s-guide-to-understanding-amyotrophic-lateral-sclerosis-als",
        "title": "A Neurologist\u2019s Guide to Understanding Amyotrophic Lateral Sclerosis (ALS)",
        "date": "14 March 2026", "iso": "2026-03-14", "read": "2 min read",
        "topic": "Conditions",
        "img": "patient-education", "alt": "A neurologist explaining a diagnosis to a patient",
        "excerpt": "ALS is a progressive neurodegenerative disease that targets the motor neurons "
                   "controlling voluntary movement. What it is, who it affects, and how we approach it.",
    },
]
POST_BY_SLUG = {p["slug"]: p for p in POSTS}


def post_card(post: dict, sizes: str = "(max-width: 980px) 92vw, 360px") -> str:
    updated = f'<span>Updated {post["updated"]}</span>' if post.get("updated") else ""
    return f"""<article class="post-card" data-reveal>
  <div class="post-card__media">{img(post['img'], post['alt'], '', sizes)}</div>
  <div class="post-card__body">
    <p class="post-card__meta"><span>{post['topic']}</span><span>{post['date']}</span><span>{post['read']}</span>{updated}</p>
    <h3><a href="{post['slug']}.html">{post['title']}</a></h3>
    <p>{post['excerpt']}</p>
    <span class="link-arrow">Read More{icon('arrow-right')}</span>
  </div>
</article>"""


def post_cards(limit: int | None = None, exclude: str | None = None) -> str:
    items = [p for p in POSTS if p["slug"] != exclude]
    if limit:
        items = items[:limit]
    return "\n".join(post_card(p) for p in items)


def post_page_body(post: dict) -> str:
    fragment = PAGES_DIR / f'{post["slug"]}.body.html'
    article = fragment.read_text(encoding="utf-8")
    updated = f'<span>Updated {post["updated"]}</span>' if post.get("updated") else ""
    related = post_cards(limit=3, exclude=post["slug"])
    return f"""
<section class="hero hero--page on-ink" aria-labelledby="post-title">
  <div class="hero__media">{img(post['img'], post['alt'], '', '100vw', 'eager')}</div>
  <div class="hero__scrim"></div>
  <div class="container hero__inner">
    <nav class="crumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="index.html">Home</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><span aria-current="page">{post['topic']}</span></li>
      </ol>
    </nav>
    <h1 class="hero__title serif" id="post-title" style="text-transform:none;letter-spacing:0">{post['title']}</h1>
    <p class="post-card__meta" style="color:#a9d4ee">
      <span>Alla Al-Habib, M.D.</span><span>{post['date']}</span><span>{post['read']}</span>{updated}
    </p>
  </div>
</section>

<article class="section">
  <div class="container container--narrow prose" data-reveal>
    {article}
  </div>

  <div class="container container--narrow mt-7">
    <aside class="card" style="flex-direction:row;gap:1.5rem;align-items:center;flex-wrap:wrap">
      <div style="flex:0 0 96px">{img('dr-alhabib-portrait', 'Alla Al-Habib, M.D.', 'avatar', '96px')}</div>
      <div style="flex:1 1 260px">
        <p class="eyebrow" style="margin-bottom:.35rem">Written by</p>
        <h2 class="title-sm" style="margin-bottom:.35rem">Alla Al-Habib, M.D.</h2>
        <p style="margin-bottom:.75rem">Triple board-certified neurologist at Texas Neurology Consultants in
           Plano, Texas, with a special interest in stroke and headache medicine.</p>
        <a class="link-arrow" href="dr-alla-al-habib.html">Read her full biography{icon('arrow-right')}</a>
      </div>
    </aside>
  </div>
</article>

<section class="section section--alt" aria-labelledby="related-title">
  <div class="container">
    <div class="section-head" data-reveal>
      <p class="eyebrow">Keep Reading</p>
      <h2 class="title-md serif" id="related-title">Recent posts</h2>
    </div>
    <div class="grid grid-3" data-reveal-group>{related}</div>
    <p class="mt-7"><a class="btn btn--outline" href="blog.html">All Posts{icon('arrow-right')}</a></p>
  </div>
</section>

<section class="cta-band section on-ink" aria-labelledby="post-cta">
  <div class="cta-band__media">{img('consult-couple', 'A neurologist in conversation with two patients')}</div>
  <div class="cta-band__scrim"></div>
  <div class="container cta-band__inner">
    <div>
      <p class="eyebrow">Ready When You Are</p>
      <h2 class="title-md serif" id="post-cta">Talk it through with a neurologist</h2>
      <p class="lede">Appointments with Dr. Al-Habib at our Plano office. Call
        <a href="tel:{SITE['phone_href']}" style="color:inherit">{SITE['phone']}</a> to get started.</p>
    </div>
    <div class="cluster">
      <a class="btn btn--gold btn--lg" href="{SITE['booking']}" target="_blank" rel="noopener noreferrer">
        {icon('calendar')}Book Appointment</a>
    </div>
  </div>
</section>"""


for _p in POSTS:
    PAGES.append(
        {
            "slug": _p["slug"],
            "path": "/post/" + _p["slug"],
            "title": f'{_p["title"]} | Texas Neurology Consultants',
            "description": re.sub(r"\s+", " ", _p["excerpt"])[:300],
            "og_image": f'{_p["img"]}.jpg',
            "post": _p["slug"],
        }
    )


def expand(text: str) -> str:
    """Resolve {{icon:name}}, {{icon:name|class}} and {{site.key}} tokens in page bodies."""

    def _icon(m):
        parts = m.group(1).split("|")
        return icon(parts[0], parts[1] if len(parts) > 1 else "")

    def _img(m):
        parts = [p.strip() for p in m.group(1).split("|")]
        parts += [""] * (5 - len(parts))
        name, alt, cls, sizes, loading = parts[:5]
        return img(name, alt, cls, sizes or "100vw", loading or "lazy")

    text = re.sub(r"\{\{post_cards(?::(\d+))?\}\}",
                  lambda m: post_cards(int(m.group(1)) if m.group(1) else None), text)
    text = re.sub(r"\{\{icon:([^}]+)\}\}", _icon, text)
    text = re.sub(r"\{\{img:([^}]+)\}\}", _img, text)
    text = re.sub(r"\{\{site\.([a-z_0-9]+)\}\}", lambda m: str(SITE[m.group(1)]), text)
    return text


def build() -> int:
    written = []
    shared = {"sprite": sprite(), "topbar": topbar(), "header": header(), "footer": footer()}

    for page in PAGES:
        if page.get("post"):
            body = expand(post_page_body(POST_BY_SLUG[page["post"]]))
        else:
            body_file = PAGES_DIR / f'{page["slug"]}.html'
            if not body_file.exists():
                print(f'  !! missing body: {body_file.relative_to(ROOT)}', file=sys.stderr)
                return 1
            body = expand(body_file.read_text(encoding="utf-8"))

        canonical = SITE["origin"] + ("/" if page["path"] == "/" else page["path"])
        head_extra = ""
        if page.get("robots"):
            head_extra += f'<meta name="robots" content="{page["robots"]}">'

        doc = LAYOUT.format(
            title=html.escape(page["title"], quote=True),
            description=html.escape(page["description"], quote=True),
            canonical=canonical,
            og_type="website" if page["slug"] != "blog" else "blog",
            og_image=f'{SITE["origin"]}/assets/img/{page["og_image"]}',
            site_name=SITE["name"],
            head_extra=head_extra,
            jsonld=structured_data(page),
            body=body,
            **shared,
        )
        # A later <meta name="robots"> in head_extra wins; drop the default for those pages.
        if page.get("robots"):
            doc = doc.replace('<meta name="robots" content="index, follow">\n', "", 1)

        out = ROOT / f'{page["slug"]}.html'
        out.write_text(doc, encoding="utf-8")
        written.append(out.name)

    # sitemap.xml — only the indexable pages
    today = date.today().isoformat()
    urls = []
    for page in PAGES:
        if page.get("robots", "").startswith("noindex"):
            continue
        loc = SITE["origin"] + ("/" if page["path"] == "/" else page["path"])
        prio = "1.0" if page["path"] == "/" else "0.8"
        urls.append(
            f"  <url><loc>{loc}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>{prio}</priority></url>"
        )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n",
        encoding="utf-8",
    )

    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE['origin']}/sitemap.xml\n", encoding="utf-8"
    )

    (ROOT / "site.webmanifest").write_text(
        json.dumps(
            {
                "name": SITE["name"],
                "short_name": "Texas Neuro",
                "description": SITE["tagline"],
                "start_url": "./index.html",
                "display": "standalone",
                "background_color": "#ffffff",
                "theme_color": "#1d3a72",
                "icons": [
                    {"src": "assets/img/logo-mark-512.png", "sizes": "512x512", "type": "image/png"},
                    {"src": "assets/img/apple-touch-icon.png", "sizes": "180x180", "type": "image/png"},
                ],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Built {len(written)} pages: {', '.join(written)}")
    print("Also wrote sitemap.xml, robots.txt, site.webmanifest")
    return 0


if __name__ == "__main__":
    raise SystemExit(build())
