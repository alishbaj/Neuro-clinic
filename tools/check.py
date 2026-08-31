#!/usr/bin/env python3
"""
Link, asset and accessibility-wiring checker for the built site.

    python3 tools/check.py

Verifies, for every generated HTML page:
  * internal page links resolve to a file that exists
  * every src / srcset / href asset path exists on disk
  * every in-page #anchor target exists
  * every aria-controls / aria-labelledby / aria-describedby / for target exists
  * every <use href="#i-…"> icon symbol is defined in that page's sprite
  * tags are balanced and ids are unique
  * every image carries alt text and intrinsic width/height
"""

from __future__ import annotations

import pathlib
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}
SELF_REF = {"aria-controls", "aria-labelledby", "aria-describedby", "aria-owns"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, int]] = []
        self.ids: list[str] = []
        self.idrefs: list[tuple[str, str, int]] = []   # (attr, id, line)
        self.links: list[tuple[str, int]] = []
        self.assets: list[tuple[str, int]] = []
        self.uses: list[tuple[str, int]] = []
        self.symbols: set[str] = set()
        self.imgs: list[tuple[dict, int]] = []
        self.labels: list[tuple[str, int]] = []
        self.errors: list[str] = []
        self.in_svg = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]

        if tag == "svg":
            self.in_svg += 1
        if tag == "symbol" and a.get("id"):
            self.symbols.add(a["id"])
        if tag == "use" and a.get("href", "").startswith("#"):
            self.uses.append((a["href"][1:], line))

        if a.get("id") and tag != "symbol":
            self.ids.append(a["id"])
        for attr in SELF_REF:
            if a.get(attr):
                for ref in a[attr].split():
                    self.idrefs.append((attr, ref, line))
        if tag == "label" and a.get("for"):
            self.labels.append((a["for"], line))

        href = a.get("href")
        if href and tag == "a":
            self.links.append((href, line))
        elif href and tag == "link" and not href.startswith(("http", "//", "#")):
            self.assets.append((href, line))

        for attr in ("src",):
            if a.get(attr) and not a[attr].startswith(("http", "data:", "//")):
                self.assets.append((a[attr], line))
        if a.get("srcset"):
            for part in a["srcset"].split(","):
                url = part.strip().split(" ")[0]
                if url and not url.startswith(("http", "data:", "//")):
                    self.assets.append((url, line))

        if tag == "img":
            self.imgs.append((a, line))

        if tag not in VOID:
            self.stack.append((tag, line))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        if tag == "svg":
            self.in_svg = max(0, self.in_svg - 1)

    def handle_endtag(self, tag):
        if tag == "svg":
            self.in_svg = max(0, self.in_svg - 1)
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f"line {self.getpos()[0]}: stray </{tag}>")
            return
        if self.stack[-1][0] != tag:
            open_tag, open_line = self.stack[-1]
            self.errors.append(
                f"line {self.getpos()[0]}: </{tag}> closes <{open_tag}> opened at line {open_line}"
            )
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i][0] == tag:
                    del self.stack[i:]
                    return
            return
        self.stack.pop()


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html"))
    if not pages:
        print("No built pages found — run `python3 build.py` first.", file=sys.stderr)
        return 1

    problems: list[str] = []
    checked_assets = 0
    checked_links = 0

    for path in pages:
        rel = path.name
        parser = Page()
        parser.feed(path.read_text(encoding="utf-8"))

        def bad(msg: str) -> None:
            problems.append(f"{rel}: {msg}")

        for err in parser.errors:
            bad(err)
        if parser.stack:
            bad("unclosed tags: " + ", ".join(f"<{t}> (line {l})" for t, l in parser.stack))

        dupes = {i for i in parser.ids if parser.ids.count(i) > 1}
        for d in sorted(dupes):
            bad(f'duplicate id "{d}"')

        idset = set(parser.ids)
        for attr, ref, line in parser.idrefs:
            if ref not in idset:
                bad(f'line {line}: {attr}="{ref}" points at a missing id')
        for ref, line in parser.labels:
            if ref not in idset:
                bad(f'line {line}: <label for="{ref}"> points at a missing id')
        for ref, line in parser.uses:
            if ref not in parser.symbols:
                bad(f'line {line}: <use href="#{ref}"> — no such icon symbol')

        for href, line in parser.links:
            target = urlparse(href)
            if target.scheme in ("http", "https", "mailto", "tel") or href.startswith("//"):
                continue
            checked_links += 1
            if href.startswith("#"):
                if href[1:] and href[1:] not in idset:
                    bad(f'line {line}: anchor "{href}" has no matching id')
                continue
            dest = ROOT / unquote(target.path)
            if not dest.exists():
                bad(f'line {line}: link "{href}" -> missing file')
            elif target.fragment:
                text = dest.read_text(encoding="utf-8")
                if f'id="{target.fragment}"' not in text:
                    bad(f'line {line}: "{href}" — target page has no id="{target.fragment}"')

        for src, line in parser.assets:
            checked_assets += 1
            if not (ROOT / unquote(urlparse(src).path)).exists():
                bad(f'line {line}: asset "{src}" is missing')

        for a, line in parser.imgs:
            if "alt" not in a:
                bad(f"line {line}: <img> without an alt attribute")
            if not a.get("width") or not a.get("height"):
                bad(f'line {line}: <img src="{a.get("src")}"> has no intrinsic width/height')

        if "<h1" not in path.read_text(encoding="utf-8"):
            bad("page has no <h1>")

    print(f"Checked {len(pages)} pages, {checked_links} internal links, {checked_assets} asset references.")
    if problems:
        print(f"\n{len(problems)} problem(s):\n")
        for p in problems:
            print("  " + p)
        return 1
    print("No problems found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
