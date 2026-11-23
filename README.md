# unteeco

Replaces `t.co` tracking links on x.com / twitter.com with the original URLs, so
you never have to resolve (or unblock) `t.co`.

## How it works

X already ships the real destination of every link: its API responses contain
`{ "url": "https://t.co/abc", "expanded_url": "https://example.com/..." }` pairs.
`src/core.js` runs in the page context at `document-start`, hooks `fetch` and
`XMLHttpRequest`, records those pairs, and rewrites the `href` of every `t.co`
anchor (tweet text, link cards, profile links...). As a fallback it also uses the
full URL X puts in the link's `title` tooltip, and shares it with other anchors
for the same `t.co` id (e.g. the preview card). No request is ever made to `t.co`.

## Layout

| Path | What |
| --- | --- |
| `src/core.js` | the only real source file |
| `build.mjs` | `node build.mjs` copies the core into the three targets below |
| `userscript/unteeco.user.js` | Tampermonkey / Violentmonkey / Greasemonkey (Chromium + Firefox) |
| `chromium/` | MV3 extension (Chrome, Edge, Brave...) |
| `firefox/` | MV3 extension (Firefox 128+) |

## Install

- **Userscript**: open `userscript/unteeco.user.js` in your userscript manager.
  It uses `@grant none` so it runs in the page context.
- **Chromium**: `chrome://extensions` -> Developer mode -> Load unpacked -> `chromium/`.
- **Firefox**: `about:debugging#/runtime/this-firefox` -> Load Temporary Add-on ->
  `firefox/manifest.json`. (For permanent install, sign it via AMO.)
