// Generates everything under dist/ from the real sources:
//   src/core.js, assets/unteeco.svg, package.json (version, description, urls)
//
//   pnpm build
//
//   dist/userscript/unteeco.user.js   userscript (installs from / updates via GitHub releases)
//   dist/userscript/unteeco.meta.js   header only, polled by userscript managers for updates
//   dist/chromium/                    unpacked extension (load unpacked)
//   dist/firefox/                     unpacked extension (load temporary add-on)
//   dist/release/*.zip                store uploads: Chrome Web Store (also Edge) and AMO
//
// Everything in dist/ is attached to a GitHub release by .github/workflows/release.yml.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { zipSync } from 'fflate';
import { Resvg } from '@resvg/resvg-js';

const root = new URL('./', import.meta.url);
const read = (p) => readFileSync(new URL(p, root));
const write = (p, data) => {
  const url = new URL(p, root);
  mkdirSync(new URL('./', url), { recursive: true });
  writeFileSync(url, data);
};

const pkg = JSON.parse(read('package.json'));
const core = read('src/core.js').toString('utf8');
const svg = read('assets/unteeco.svg');

// Chrome and Firefox only accept 1-4 dot-separated integers (no "-beta" etc).
if (!/^\d+(\.\d+){0,3}$/.test(pkg.version)) {
  throw new Error(`package.json version "${pkg.version}" is not a valid extension version`);
}

const png = (size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

const repo = pkg.homepage; // https://github.com/<owner>/<repo>
const latest = `${repo}/releases/latest/download`;
const matches = ['https://x.com/*', 'https://twitter.com/*', 'https://mobile.twitter.com/*'];

rmSync(new URL('dist/', root), { recursive: true, force: true });

// ---------------------------------------------------------------- userscript
// @icon must be a URL; a data URI keeps the script self-contained.
const icon = png(64).toString('base64');
const header = `// ==UserScript==
// @name         unteeco - replace t.co links with the original URLs
// @namespace    ${repo}
// @version      ${pkg.version}
// @description  Rewrites t.co tracking links on x.com / twitter.com to their real destination using data X already ships, so t.co is never contacted.
// @author       ${pkg.author}
// @license      ${pkg.license}
// @homepageURL  ${repo}
// @supportURL   ${pkg.bugs}
// @icon         data:image/png;base64,${icon}
// @updateURL    ${latest}/unteeco.meta.js
// @downloadURL  ${latest}/unteeco.user.js
${matches.map((m) => `// @match        ${m}`).join('\n')}
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==
`;
write('dist/userscript/unteeco.user.js', `${header}\n${core}`);
write('dist/userscript/unteeco.meta.js', header);

// ------------------------------------------------------------------- addons
const iconSizes = [16, 32, 48, 96, 128];

const manifest = {
  manifest_version: 3,
  name: 'unteeco',
  version: pkg.version,
  description: pkg.description,
  homepage_url: repo,
  icons: Object.fromEntries(iconSizes.map((s) => [s, `icons/${s}.png`])),
  content_scripts: [
    {
      matches,
      js: ['unteeco.js'],
      run_at: 'document_start',
      // The hooks must run in the page's own JS context, not an isolated world.
      world: 'MAIN',
    },
  ],
};

const manifests = {
  chromium: {
    ...manifest,
    minimum_chrome_version: '111', // first Chrome with content_scripts "world": "MAIN"
  },
  firefox: {
    ...manifest,
    browser_specific_settings: {
      gecko: {
        // Permanent once published on AMO: never change it.
        id: 'unteeco@nicexe.github.io',
        strict_min_version: '128.0', // first Firefox with content_scripts "world": "MAIN"
        data_collection_permissions: { required: ['none'] },
      },
    },
  },
};

const enc = new TextEncoder();
for (const [name, m] of Object.entries(manifests)) {
  /** @type {Record<string, Uint8Array>} */
  const files = {
    'manifest.json': enc.encode(JSON.stringify(m, null, 2) + '\n'),
    'unteeco.js': enc.encode(core),
  };
  for (const s of iconSizes) files[`icons/${s}.png`] = png(s);

  for (const [path, data] of Object.entries(files)) write(`dist/${name}/${path}`, data);

  // Fixed mtime so the same sources always produce the same zip.
  const zip = zipSync(files, { level: 9, mtime: new Date(Date.UTC(2000, 0, 1)) });
  write(`dist/release/unteeco-${name}-${pkg.version}.zip`, zip);
}

console.log(`built unteeco ${pkg.version} -> dist/{userscript,chromium,firefox,release}`);
