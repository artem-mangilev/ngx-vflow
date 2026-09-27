// Prints the outer HTML of the first displayed edge and node of the demo, to see what gets painted.
import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4200';
const path = process.argv[3] ?? '/performance/virtualization';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(base + path, { waitUntil: 'networkidle' });
await page.waitForFunction(() => [...document.querySelectorAll('.vflow-node')].some((n) => n.style.visibility === 'visible'));
console.log(
  await page.evaluate(() => {
    const edge = [...document.querySelectorAll('svg[edge]')].find((e) => e.style.display !== 'none');
    const node = [...document.querySelectorAll('.vflow-node')].find((n) => n.style.display !== 'none');
    const defs = document.querySelector('.vflow-defs-svg');
    const clean = (s) => s.replace(/ _ng(content|host)-[a-z0-9-]+=""/g, '').replace(/ ng-reflect-[a-z-]+="[^"]*"/g, '');
    return ['=== edge', clean(edge.outerHTML), '=== node', clean(node.outerHTML), '=== defs', clean(defs.outerHTML).slice(0, 1200)].join('\n');
  }),
);
await browser.close();
