// Renders sheet-lockup.png: the lockup with the word in several sizes, trackings and weights, to choose from.
// Each variant is shown at 96 px, at 28 px (the header of the docs) and at 20 px.
// The word is live text here (Geist Sans from the Studio checkout); the chosen numbers go into build-lockup.py.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(new URL('../../apps/docs-e2e/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const mark = readFileSync(new URL('./final/mark.svg', import.meta.url), 'utf8').match(/ d="([^"]+)"/)[1];
const face = (weight) =>
  `@font-face{font-family:Geist;font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(
    new URL(`../../../vflow-studio/node_modules/@fontsource/geist-sans/files/geist-sans-latin-${weight}-normal.woff2`, import.meta.url),
  ).toString('base64')})}`;

// size on the 64 box of the mark, tracking in em, weight, gap between the mark and the word
const variants = [
  ['Было · 600, кегль 48, трекинг −0,02', 48, -0.02, 600, 18],
  ['C · 600, кегль 64 — оказалось крупно', 64, 0, 600, 22],
  ['F · 600, кегль 56', 56, 0, 600, 20],
  ['G · 700, кегль 56 — выбран', 56, 0, 700, 20],
  ['H · 800, кегль 56', 56, 0, 800, 20],
  ['I · 700, кегль 52', 52, 0, 700, 19],
];
// The word is centred on the mark the way build-lockup.py does it: by the bounds of its outlines (-10..708 of 1000).
const lockup = ([, size, tracking, weight, gap], dark, height) => `
  <svg viewBox="0 0 300 64" height="${height}" style="display:block">
    <linearGradient id="${dark ? 'd' : 'l'}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${dark ? '#bbe1fa' : '#3282b8'}"/><stop offset="1" stop-color="${dark ? '#3282b8' : '#0f4c75'}"/>
    </linearGradient>
    <path fill="url(#${dark ? 'd' : 'l'})" d="${mark}"/>
    <text x="${64 + gap - 0.021 * size}" y="${32 + 0.349 * size}" font-family="Geist" font-weight="${weight}" font-size="${size}"
      letter-spacing="${tracking}em" fill="${dark ? '#fff' : '#1b262c'}">vflow</text>
  </svg>`;
const cell = (v, dark) =>
  `<div style="background:${dark ? '#1b262c' : '#fff'};padding:28px 32px;display:flex;gap:40px;align-items:center">
    ${lockup(v, dark, 96)}${lockup(v, dark, 28)}${lockup(v, dark, 20)}</div>`;
const html = `<style>${[600, 700, 800].map(face).join('')}body{margin:0;padding:12px;background:#999;width:max-content;
  display:grid;grid-template-columns:auto auto;gap:6px 8px;font:600 15px system-ui}
  h2{grid-column:1/-1;margin:10px 0 0;font:inherit;color:#111}</style>
  ${variants.map((v) => `<h2>${v[0]}</h2>${cell(v, false)}${cell(v, true)}`).join('')}`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await (await page.$('body')).screenshot({ path: new URL('./sheet-lockup.png', import.meta.url).pathname });
await browser.close();
