// Screenshots of the first demo of a docs page in the light and the dark theme:
//   node shot.mjs design-system/workflow out-prefix [viewportWidth]
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/');
const { chromium } = require('@playwright/test');
const [path, prefix, width = '1440'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 1000 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:4200/' + path, { waitUntil: 'networkidle' });
const demo = page.locator('.demo').first();
for (const theme of ['light', 'dark']) {
  for (let i = 0; i < 3; i++) {
    const current = await page.locator('html').getAttribute('data-theme');
    if ((theme === 'dark') === (current === 'dark')) break;
    await page.locator('ng-doc-theme-toggle button').click();
    await page.waitForTimeout(300);
  }
  await demo.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1500);
  const zoom = await demo.locator('.vui-node').first().evaluate((n) => n.getBoundingClientRect().width / n.offsetWidth);
  const box = await demo.locator('vflow').first().boundingBox();
  await demo.screenshot({ path: `${prefix}-${theme}.png` });
  console.log(theme, 'zoom', zoom.toFixed(3), 'canvas', Math.round(box.width) + 'x' + Math.round(box.height));
}
await browser.close();
