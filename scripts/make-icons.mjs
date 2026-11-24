// Rasterizes assets/unteeco.svg into the PNG sizes the addons and userscript need.
//   npm i --no-save @resvg/resvg-js && node scripts/make-icons.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const root = new URL('../', import.meta.url);
const svg = readFileSync(new URL('assets/unteeco.svg', root));

const render = (size) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

// Extension icons: Chrome uses 16/32/48/128, Firefox uses 16/32/48/96 (+ HiDPI).
for (const dir of ['chromium', 'firefox']) {
  mkdirSync(new URL(`${dir}/icons/`, root), { recursive: true });
  for (const size of [16, 32, 48, 96, 128]) {
    writeFileSync(new URL(`${dir}/icons/${size}.png`, root), render(size));
  }
}
// Embedded into the userscript header by build.mjs.
writeFileSync(new URL('assets/icon-64.png', root), render(64));
console.log('icons written');
