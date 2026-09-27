# Archfolio — Architecture & Data Center Portfolio

The portfolio of MohammadAmin Sadeghi, architectural and data center designer. A static site: plain HTML, CSS and JavaScript. It has no framework or build step and runs on any static host, or straight from the file system.

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

## Accounts and admin (Firebase)
Visitors can create an account with a Gmail address and a password they choose. No code or email is ever sent. The admin registers on the site the same way, and the account (`ADMIN_EMAIL` in `js/firebase-config.js`) gets an admin panel with registered users, project requests, and an editor for all site content. Published edits reach every visitor; the built-in content in `js/data.js` stays as the default.

1. Follow `firebase/SETUP-FA.md` (Persian, step by step).
2. Paste your web config into `js/firebase-config.js`.
3. Paste `firebase/firestore.rules` into Firestore → Rules.
4. Open the Account tab and create the admin account with the admin Gmail before sharing the link. After that, nobody else can register that address.

Until step 2 is done, the Account tab says accounts are coming soon, and the rest of the site works as before.
The Firebase SDK (`js/vendor/firebase.js`) is bundled from npm. See `tools/firebase/entry.js` to rebuild it.
For local testing, run `firebase emulators:start` in `firebase/` and set `emulator: true` in the config.

## Android app
`python3 android/build_apk.py` builds `android/dist/Archfolio.apk`: a full-screen WebView around this site, signed v1+v2. It needs no Android SDK (see the script header). The app id is `com.archfolio.app`. The signing key is created on the first build in `~/.archfolio-android/`. Keep that folder, because updates must be signed with the same key. (Builds before the Archfolio name used another app id, so they install as a separate app; uninstall the old one.)

## Windows app
`desktop/build_exe.sh` builds `desktop/dist/Archfolio.exe`: one portable file with no installer. It needs Go and `go-winres`. The site is embedded and shown in WebView2, which is built into Windows 10 and 11.

## Add a project
1. Put the images in `img/` and any proposal pages in `img/proposals/<slug>/01.webp`, `02.webp`, …
2. Run `python3 tools/build_images.py` (needs Pillow). It creates the 800 px variants and updates `js/media.js`.
3. Copy an existing entry in the `projects` array of `js/data.js` and edit it. Optional fields (`overview`, `approach`, `groups`, `gallery`, `proposal`, `model`, `boards` …) show up only when present.

## Logo
The mark and wordmark are generated geometry, not traced images. Edit the constants in `tools/brand.py` and run `python3 tools/brand.py` (needs shapely). It rewrites the logo sprite in `index.html` and `img/logo-mark.svg`. Then run `node tools/build_icons.js` (needs Playwright) to render the favicons, the app icons and the Android launcher icons from the new mark.

## Theme and language
Dark is the default; the toggle switches to light. EN / FA swaps interface text in place and switches to right-to-left. Project case studies stay in English.

## Single-file version
`python3 tools/build_single_html.py out.html` bundles everything (CSS, JS, fonts, images, 3D models) into one ~18 MB HTML file you can email or open offline. Deploy the multi-file site for real visitors: it loads much faster. Opened from disk, the multi-file site falls back to system fonts because browsers block web fonts on `file://`; the single file has its fonts embedded.
