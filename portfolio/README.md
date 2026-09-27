# MohammadAmin Sadeghi — Portfolio

Architectural & Data Center Designer. A static site: plain HTML, CSS and JavaScript. It has no framework or build step and runs on any static host, or straight from the file system.

## Deploy
Upload the contents of this folder (`index.html`, `css/`, `js/`, `img/`, `fonts/`, `models/`, `site.webmanifest`, `robots.txt`) to any static host (GitHub Pages, Netlify, Cloudflare Pages, shared hosting).
Once the live address is known, set `SITE.url` in `js/data.js`, and replace the relative `og:url` / `og:image` / `canonical` values in `index.html` with absolute ones. Social networks read those tags before any JavaScript runs.

## Structure
| Path | What it holds |
|---|---|
| `js/data.js` | **All content**: profile, projects, objects, services, process, home sections, navigation, data-center systems |
| `js/app.js` | Router (`#/work/<slug>`), page renderers, lightbox, 3D viewer, Persian switch, intro |
| `js/dc-scene.js` | The interactive isometric data hall on the home page |
| `js/i18n-fa.js` | Persian interface strings, loaded only when FA is selected |
| `js/media.js` | Generated image sizes (do not edit by hand) |
| `css/site.css` | One stylesheet, driven by tokens at the top (colours, spacing, type) |
| `img/` | Project images; `img/sm/` holds 800 px variants; `img/proposals/<slug>/NN.webp` holds proposal pages |
| `models/` | Standalone interactive 3D model pages (Three.js is loaded from unpkg.com, so they need an internet connection) |

## Add a project
1. Put the images in `img/` and any proposal pages in `img/proposals/<slug>/01.webp`, `02.webp`, …
2. Run `python3 tools/build_images.py` (needs Pillow). It creates the 800 px variants and updates `js/media.js`.
3. Copy an existing entry in the `projects` array of `js/data.js` and edit it. Optional fields (`overview`, `approach`, `groups`, `gallery`, `proposal`, `model`, `boards` …) show up only when present.

## Logo
The mark and wordmark are generated geometry, not traced images. Edit the constants in `tools/brand.py` and run `python3 tools/brand.py` (needs shapely). It rewrites the logo sprite in `index.html` and `img/logo-mark.svg`.

## Theme and language
Dark is the default; the toggle switches to light. EN / FA swaps interface text in place and switches to right-to-left. Project case studies stay in English.

## Single-file version
`python3 tools/build_single_html.py out.html` bundles everything (CSS, JS, fonts, images, 3D models) into one ~18 MB HTML file you can email or open offline. Deploy the multi-file site for real visitors: it loads much faster. Opened from disk, the multi-file site falls back to system fonts because browsers block web fonts on `file://`; the single file has its fonts embedded.
