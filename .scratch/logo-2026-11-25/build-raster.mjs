// Renders the raster files of the logo from the SVGs in final/, with the Chromium of the docs e2e project:
// favicon.ico (16, 32, 48), apple-touch-icon.png, avatar.png, og.png, github-cover.png.
// Run after build-mark.py and build-lockup.py: `node build-raster.mjs`.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(new URL('../../apps/docs-e2e/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const final = new URL('./final/', import.meta.url);
const svg = (name) => readFileSync(new URL(name, final), 'utf8');
const INK = '#1b262c';

const browser = await chromium.launch();
const page = await browser.newPage();
// One SVG centred on a canvas of the given size; without a background the PNG is transparent.
async function shot(width, height, source, { background, svgWidth, svgHeight }) {
  await page.setViewportSize({ width, height });
  const sized = source.replace('<svg ', `<svg style="width:${svgWidth};height:${svgHeight};display:block" `);
  await page.setContent(
    `<body style="margin:0;height:100vh;display:grid;place-items:center;background:${background ?? 'transparent'}">${sized}</body>`,
  );
  return page.screenshot({ omitBackground: !background });
}
const save = (name, buffer) => writeFileSync(new URL(name, final), buffer);

// The tab icon for browsers without SVG icons: one colour that reads on a light and on a dark tab.
const flat = svg('mark.svg').replace('currentColor', '#3282b8');
const icons = [];
for (const size of [16, 32, 48]) icons.push([size, await shot(size, size, flat, { svgWidth: '100%', svgHeight: '100%' })]);
// An .ico is a header, a directory entry per image, then the PNGs themselves.
const header = Buffer.alloc(6 + 16 * icons.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icons.length, 4);
let offset = header.length;
icons.forEach(([size, png], i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(size, at);
  header.writeUInt8(size, at + 1);
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(png.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += png.length;
});
save('favicon.ico', Buffer.concat([header, ...icons.map(([, png]) => png)]));

// Square icons that the platform crops itself: the dark plate without corners.
const onPlate = { background: INK, svgWidth: '60%', svgHeight: '60%' };
save('apple-touch-icon.png', await shot(180, 180, svg('mark-dark.svg'), onPlate));
save('avatar.png', await shot(512, 512, svg('mark-dark.svg'), onPlate));
// Link previews: the lockup at about half of the width.
const lockup = { background: INK, svgWidth: '52%', svgHeight: 'auto' };
save('og.png', await shot(1200, 630, svg('lockup-dark.svg'), lockup));
save('github-cover.png', await shot(1280, 640, svg('lockup-dark.svg'), lockup));
await browser.close();
