// Renders sheet-fonts.png: the lockup with the word "vflow" in other typefaces, next to the current Geist Sans Bold,
// and sheet-nunito.png: the chosen Nunito in several weights, sizes and trackings.
// The candidates come from Google Fonts at render time (all under the Open Font License), Geist from the Studio
// checkout. Every word is scaled to the x-height of the current one and centred on the mark by its own bounds, so the
// sheet compares the letterforms, not the sizes the fonts happen to have.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(new URL('../../apps/docs-e2e/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const mark = readFileSync(new URL('./final/mark.svg', import.meta.url), 'utf8').match(/ d="([^"]+)"/)[1];
const geist = readFileSync(
  new URL('../../../vflow-studio/node_modules/@fontsource/geist-sans/files/geist-sans-latin-700-normal.woff2', import.meta.url),
).toString('base64');

// label, family, weight (the closest to the stroke of Geist Bold), then optionally tracking in em and a factor
// on the size that the x-height of the current word gives
const candidates = [
  ['Сейчас', 'Geist Local', 700],
  ['Нейтральный гротеск', 'Inter', 700],
  ['Нейтральный гротеск', 'Figtree', 700],
  ['Нейтральный гротеск', 'Onest', 700],
  ['Геометрический', 'Manrope', 800],
  ['Геометрический', 'Plus Jakarta Sans', 700],
  ['Геометрический', 'Outfit', 600],
  ['Геометрический', 'Sora', 600],
  ['Геометрический', 'Urbanist', 700],
  ['Геометрический', 'Lexend', 600],
  ['Скруглённый', 'Nunito', 800],
  ['Скруглённый', 'Rubik', 600],
  ['Скруглённый', 'Quicksand', 700],
  ['С характером', 'Space Grotesk', 700],
  ['С характером', 'Red Hat Display', 700],
  ['С характером', 'Bricolage Grotesque', 700],
  ['С характером', 'Unbounded', 600],
  ['Моноширинный', 'JetBrains Mono', 700],
];
const nunito = [
  ['Сейчас', 'Geist Local', 700],
  ['высота строчных как сейчас', 'Nunito', 700],
  ['высота строчных как сейчас', 'Nunito', 800],
  ['высота строчных как сейчас', 'Nunito', 900],
  ['трекинг −0,02', 'Nunito', 800, -0.02],
  ['трекинг −0,02', 'Nunito', 900, -0.02],
  ['на 8% мельче', 'Nunito', 800, 0, 0.92],
  ['на 8% мельче — выбран', 'Nunito', 900, 0, 0.92],
  ['на 8% мельче, трекинг −0,02', 'Nunito', 900, -0.02, 0.92],
];
const families = [...candidates.slice(1).map(([, family, weight]) => `family=${family.replaceAll(' ', '+')}:wght@${weight}`), 'family=Nunito:wght@700;800;900'].join('&');

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${families}&display=block">
  <style>@font-face{font-family:'Geist Local';font-weight:700;src:url(data:font/woff2;base64,${geist})}
  body{margin:0;padding:12px;background:#999;width:max-content;display:grid;grid-template-columns:auto auto auto;gap:8px;font:600 14px system-ui}
  .card{background:#fff;padding:14px 20px 18px;display:grid;gap:12px}
  .small{display:flex;gap:10px;align-items:center}.small div{padding:10px 14px}</style>`);
const render = (fonts, file) => page.evaluate(
  async ({ fonts, mark }) => {
    document.querySelectorAll('.card').forEach((card) => card.remove());
    const missing = [];
    for (const [, family, weight] of fonts) {
      await document.fonts.load(`${weight} 56px "${family}"`, 'vflow');
      // a family that did not load would be drawn in the fallback font and pass for a candidate
      if (!document.fonts.check(`${weight} 56px "${family}"`, 'vflow')) missing.push(family);
    }
    const context = document.createElement('canvas').getContext('2d');
    const measure = (family, weight, size, text, tracking = 0) => {
      context.font = `${weight} ${size}px "${family}"`;
      context.letterSpacing = `${tracking * size}px`;
      return context.measureText(text);
    };
    const xHeight = (family, weight) => measure(family, weight, 1000, 'x').actualBoundingBoxAscent / 1000;
    const target = xHeight(fonts[0][1], fonts[0][2]) * 56; // the x-height of the current word on the 64 box of the mark
    const lockup = ([, family, weight, tracking = 0, factor = 1], dark, height) => {
      const size = (target / xHeight(family, weight)) * factor;
      const box = measure(family, weight, size, 'vflow', tracking);
      const x = 64 + 20 + box.actualBoundingBoxLeft;
      const y = 32 + (box.actualBoundingBoxAscent - box.actualBoundingBoxDescent) / 2;
      const id = (dark ? 'd' : 'l') + Math.random().toString(36).slice(2);
      return `<svg viewBox="0 0 ${(x + box.actualBoundingBoxRight).toFixed(1)} 64" height="${height}" style="display:block">
        <linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${dark ? '#bbe1fa' : '#3282b8'}"/>
        <stop offset="1" stop-color="${dark ? '#3282b8' : '#0f4c75'}"/></linearGradient>
        <path fill="url(#${id})" d="${mark}"/>
        <text x="${x}" y="${y}" font-family="${family}" font-weight="${weight}" font-size="${size}"
          letter-spacing="${tracking}em" fill="${dark ? '#fff' : '#1b262c'}">vflow</text></svg>`;
    };
    document.body.innerHTML += fonts
      .map(
        (font) => `<div class="card">
          <div style="color:#555">${font[1].replace(' Local', ' Sans')} ${font[2]} · ${font[0]}</div>
          ${lockup(font, false, 72)}
          <div class="small"><div>${lockup(font, false, 28)}</div>
          <div style="background:#1b262c">${lockup(font, true, 28)}</div></div></div>`,
      )
      .join('');
    return missing;
  },
  { fonts, mark },
).then(async (missing) => {
  if (missing.length) console.error('not loaded, drawn in a fallback font:', missing.join(', '));
  await (await page.$('body')).screenshot({ path: new URL(file, import.meta.url).pathname });
});
await render(candidates, './sheet-fonts.png');
await render(nunito, './sheet-nunito.png');
await browser.close();
