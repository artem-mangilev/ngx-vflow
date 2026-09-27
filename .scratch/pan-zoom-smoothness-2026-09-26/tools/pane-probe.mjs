// Prints the ancestors of the demo pane with their widths, to craft CSS that enlarges the demo.
import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4200';
const path = process.argv[3] ?? '/performance/virtualization';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 2700, height: 1100 } });
await page.goto(base + path, { waitUntil: 'networkidle' });
if (process.argv[4]) await page.addStyleTag({ content: process.argv[4] });
await page.locator('.vflow-pane').first().waitFor();
await new Promise((r) => setTimeout(r, 500));
console.log(
  await page.evaluate(() => {
    const out = [];
    for (let el = document.querySelector('.vflow-pane'); el; el = el.parentElement) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''} ${Math.round(r.width)}x${Math.round(r.height)} maxW=${cs.maxWidth} w=${cs.width} h=${cs.height} disp=${cs.display}`);
    }
    return out.join('\n');
  }),
);
await browser.close();
