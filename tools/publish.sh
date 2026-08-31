#!/usr/bin/env bash
# Rebuild and publish the site to the gh-pages branch that GitHub Pages serves.
# Use this when the Actions workflow cannot push (read-only workflow permissions).
#
#   ./tools/publish.sh
set -euo pipefail

cd "$(dirname "$0")/.."
python3 build.py
python3 tools/check.py

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cp -R assets favicon.png "$WORK/"
cp ./*.html sitemap.xml robots.txt site.webmanifest "$WORK/"
touch "$WORK/.nojekyll"

REMOTE="$(git remote get-url origin)"
SHA="$(git rev-parse --short HEAD)"

cd "$WORK"
git init -q -b gh-pages
git config user.name  "$(git -C - config user.name  2>/dev/null || echo 'site publisher')"
git config user.email "$(git -C - config user.email 2>/dev/null || echo 'publisher@example.com')"
git add -A
git commit -q -m "Publish site from ${SHA}"
git push -q --force "$REMOTE" gh-pages

echo "Published ${SHA} to gh-pages."
