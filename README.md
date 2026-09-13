# Neuro Longevity Care — homepage source

## Files
- index.dc.html — the page (markup + logic). Open directly in a browser.
- support.js — runtime the page loads. Must sit next to index.dc.html.
- page-logic.js — the page's JavaScript on its own (symptom data, booking
  flow state, validation, FAQ accordion). Reference copy; the live copy is
  the <script data-dc-script> block inside index.dc.html.
- assets/ — sunrise-loop.html (hero animation), photos.

## To display it
Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages,
cPanel) keeping the structure, then point at index.dc.html — or rename it
index.html. No build step, no npm, no server code.

## To edit
Copy/text and inline styles are in the markup of index.dc.html.
Behaviour (symptoms, slots, states, validation) is in the
`class Component` block at the bottom of that file.
