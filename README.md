# Neuro Longevity Care — homepage source

**Live site:** https://alishbaj.github.io/Neuro-clinic/

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/alishbaj/Neuro-clinic?quickstart=1)

## Run it locally

You need Python 3 (preinstalled on macOS and most Linux) and nothing else.

```sh
git clone https://github.com/alishbaj/Neuro-clinic.git
cd Neuro-clinic
./serve.sh          # macOS / Linux
serve.bat           # Windows
```

Then open **http://localhost:8000**. Refresh the browser after editing a file.
Use a different port with `./serve.sh 3000` / `serve.bat 3000`.

The page has to be served over http — double-clicking `index.html` won't load
the hero animation or scripts properly.

### No local setup

Click **Open in GitHub Codespaces** above. It starts the same server in the
cloud and opens a preview of the site automatically.

## Files
- index.html — the page (markup + logic).
- support.js — runtime the page loads. Must sit next to index.html.
- page-logic.js — the page's JavaScript on its own (symptom data, booking
  flow state, validation, FAQ accordion). Reference copy; the live copy is
  the <script data-dc-script> block inside index.html.
- assets/ — sunrise-loop.html (hero animation), photos.
- serve.sh / serve.bat — start a local server on port 8000.

## Publishing
Every push to `main` publishes the site to GitHub Pages via
`.github/workflows/publish.yml`. No build step, no npm, no server code.

## To edit
Copy/text and inline styles are in the markup of index.html.
Behaviour (symptoms, slots, states, validation) is in the
`class Component` block at the bottom of that file.
