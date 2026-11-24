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

## Install

| Platform | Install | Updates |
| --- | --- | --- |
| Userscript (Violentmonkey, Tampermonkey, Greasemonkey; Chromium and Firefox) | [**Install latest release**](https://github.com/nicexe/unteeco/releases/latest/download/unteeco.user.js) | Automatic, from GitHub releases |
| Chromium (Chrome, Edge, Brave...) | Chrome Web Store: coming soon | Automatic, via the store |
| Firefox (128+) | addons.mozilla.org: coming soon | Automatic, via AMO |

The userscript checks for new versions through `@updateURL` / `@downloadURL` and runs in the page
context (`@grant none`). Until the store listings exist, the addons can be loaded from a local
build (see [Build](#build)): in Chromium use `chrome://extensions` -> Developer mode -> Load
unpacked -> `dist/chromium/`; in Firefox use `about:debugging#/runtime/this-firefox` -> Load
Temporary Add-on -> `dist/firefox/manifest.json`. Locally loaded addons do not auto-update.

## Build

Only the sources are committed; everything else is generated into `dist/`.

```
pnpm install
pnpm build
```

| Source | Used for |
| --- | --- |
| `src/core.js` | the script itself (the only real code) |
| `assets/unteeco.svg` | icon, rasterized to PNGs |
| `package.json` | version, description, author, license and repo URLs |
| `build.mjs` | generates the manifests, userscript header, icons and zips |

| Output | What |
| --- | --- |
| `dist/userscript/unteeco.user.js`, `unteeco.meta.js` | userscript and its header-only update-check file |
| `dist/chromium/`, `dist/firefox/` | unpacked MV3 extensions for local testing |
| `dist/release/unteeco-{chromium,firefox}-<version>.zip` | uploads for the Chrome Web Store (also Edge Add-ons) and AMO |

## Releasing

1. Bump `version` in `package.json` (plain `1.2.3`, no suffixes), commit.
2. `git tag v1.2.3 && git push origin master v1.2.3`.
3. `.github/workflows/release.yml` builds and publishes a GitHub release with the userscript,
   `unteeco.meta.js` and both zips attached. Userscript managers pick the new version up from there.
4. Upload `unteeco-chromium-<version>.zip` to the Chrome Web Store dashboard and
   `unteeco-firefox-<version>.zip` to addons.mozilla.org (store submissions are manual).

The Firefox add-on ID (`unteeco@nicexe.github.io`, in `build.mjs`) is permanent once published on AMO.

## License

MIT, see `LICENSE`.
