// Assembles the three deliverables from src/core.js (the single shared source).
//   node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const core = readFileSync(new URL('./src/core.js', import.meta.url), 'utf8');

const header = `// ==UserScript==
// @name         unteeco - replace t.co links with the original URLs
// @namespace    https://github.com/unteeco
// @version      1.0.0
// @description  Rewrites t.co tracking links on x.com / twitter.com to their real destination using data X already ships, so t.co is never contacted.
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

`;

writeFileSync(new URL('./userscript/unteeco.user.js', import.meta.url), header + core);
writeFileSync(new URL('./chromium/unteeco.js', import.meta.url), core);
writeFileSync(new URL('./firefox/unteeco.js', import.meta.url), core);
console.log('built userscript/, chromium/, firefox/');
