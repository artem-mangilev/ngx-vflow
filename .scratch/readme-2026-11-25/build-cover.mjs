// The cover of the README: the hero flow of the landing page, drawn by the library itself, with the logo lockup.
// Needs the docs dev server (`pnpm start`). From the repository root:
//   node .scratch/readme-2026-11-25/build-cover.mjs [http://localhost:4200]
// Writes .github/readme/cover-light.png and cover-dark.png, 1800×960 (shown as 1200×640 at most).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(process.cwd() + '/apps/docs-e2e/');
const { chromium } = require('@playwright/test');

const origin = process.argv[2] ?? 'http://localhost:4200';
const OUT = '.github/readme';
// The flow is drawn 1.5 times its size on the site, so its 13px text is still readable in a README column.
const SCALE = 1.5;
const PIXELS = 1800;
const WIDTH = 1200 / SCALE;
const HEIGHT = 640 / SCALE;
// Where the scene and the lockup stand, in pixels of the scaled page. The scene is centered vertically, and the
// lockup stands on the line of its bottom.
const SCENE = { right: 36 };
const LOCKUP = { left: 40, height: 38 };

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: Math.ceil(HEIGHT) },
    deviceScaleFactor: PIXELS / WIDTH,
    colorScheme: theme,
    // No entrance and no turning angle: the same picture on every run.
    reducedMotion: 'reduce',
  });

  // The docs keep their theme in the storage and do not follow the system until asked to.
  await page.addInitScript((id) => localStorage.setItem('ng-doc-theme-id', id), theme);
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.waitForSelector('app-hero-flow [vuiNode], app-hero-flow article');

  // The hero section becomes the whole picture: no copy, no navbar, dots over all of it.
  await page.evaluate(
    ({ lockup, theme }) => {
      const flow = document.querySelector('app-hero-flow');
      const section = flow.closest('section');
      const background = getComputedStyle(document.body).backgroundColor;
      const style = document.createElement('style');

      style.textContent = `
        section[data-cover] { position: fixed; inset: 0; z-index: 99999; height: 100vh; border: 0;
          background: ${background === 'rgba(0, 0, 0, 0)' ? 'Canvas' : background}; }
        section[data-cover] > .landing-width { visibility: hidden; }
        section[data-cover] app-hero-flow > div { mask-image: none; }
        [data-cover-lockup] { position: absolute; z-index: 2; pointer-events: none;
          left: ${lockup.left}px; height: ${lockup.height}px; }
      `;
      document.head.append(style);
      section.dataset.cover = '';

      const image = document.createElement('img');

      image.dataset.coverLockup = '';
      image.src = theme === 'dark' ? 'assets/lockup-dark.svg' : 'assets/lockup.svg';
      section.append(image);

      return image.decode();
    },
    { lockup: LOCKUP, theme },
  );
  // The flow fits itself into its slot again after the resize.
  await page.waitForTimeout(500);

  // Pan the canvas so that the scene stands where the cover wants it.
  const box = await page.evaluate(() => {
    const rects = [...document.querySelectorAll('app-hero-flow article')].map((node) => node.getBoundingClientRect());

    return {
      right: Math.max(...rects.map((r) => r.right)),
      top: Math.min(...rects.map((r) => r.top)),
      bottom: Math.max(...rects.map((r) => r.bottom)),
    };
  });
  const margin = (HEIGHT - (box.bottom - box.top)) / 2;

  await page.evaluate((bottom) => {
    document.querySelector('[data-cover-lockup]').style.bottom = `${bottom}px`;
  }, margin);
  const from = { x: 8, y: 8 };

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + (WIDTH - SCENE.right - box.right), from.y + (margin - box.top), { steps: 8 });
  await page.mouse.up();
  await page.mouse.move(WIDTH - 2, HEIGHT - 2);
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/cover-${theme}.png`, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  await page.close();
}

await browser.close();
