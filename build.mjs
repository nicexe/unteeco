// Generates everything under dist/ from the real sources:
//   src/core.js, assets/unteeco.svg, package.json (version + description)
//
//   pnpm build
//
//   dist/userscript/unteeco.user.js
//   dist/chromium/   (load unpacked)
//   dist/firefox/    (load temporary add-on)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

const png = (size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

const matches = ['https://x.com/*', 'https://twitter.com/*', 'https://mobile.twitter.com/*'];

rmSync(new URL('dist/', root), { recursive: true, force: true });

// ---------------------------------------------------------------- userscript
// @icon must be a URL; a data URI keeps the script self-contained.
const icon = png(64).toString('base64');
const header = `// ==UserScript==
// @name         unteeco - replace t.co links with the original URLs
// @namespace    https://github.com/unteeco
// @version      ${pkg.version}
// @description  Rewrites t.co tracking links on x.com / twitter.com to their real destination using data X already ships, so t.co is never contacted.
// @icon         data:image/png;base64,${icon}
${matches.map((m) => `// @match        ${m}`).join('\n')}
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

`;
write('dist/userscript/unteeco.user.js', header + core);

// ------------------------------------------------------------------- addons
const iconSizes = [16, 32, 48, 96, 128];

const manifest = {
  manifest_version: 3,
  name: 'unteeco',
  version: pkg.version,
  description: pkg.description,
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

const targets = {
  chromium: manifest,
  firefox: {
    ...manifest,
    browser_specific_settings: {
      gecko: {
        id: 'unteeco@unteeco',
        strict_min_version: '128.0', // first Firefox with content_scripts "world": "MAIN"
        data_collection_permissions: { required: ['none'] },
      },
    },
  },
};

for (const [name, m] of Object.entries(targets)) {
  write(`dist/${name}/manifest.json`, JSON.stringify(m, null, 2) + '\n');
  write(`dist/${name}/unteeco.js`, core);
  for (const s of iconSizes) write(`dist/${name}/icons/${s}.png`, png(s));
}

console.log('built dist/{userscript,chromium,firefox}');
