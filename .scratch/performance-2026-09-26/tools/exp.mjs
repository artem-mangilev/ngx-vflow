// DOM geometry read micro-benchmark on the loaded virtualization demo.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4201';
const harness = readFileSync(new URL('./harness.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(base + '/introduction/overview', { waitUntil: 'networkidle' });
await page.evaluate(harness);
await page.evaluate(() => __perf.gotoAndWait('/performance/virtualization'));
const r = await page.evaluate(() => {
  const wrappers = [...document.querySelectorAll('.vflow-node .wrapper')];
  const ports = [...document.querySelectorAll('.vflow-handle')];
  const time = (label, fn) => {
    const t0 = performance.now();
    const n = fn();
    return [label, Math.round((performance.now() - t0) * 100) / 100, n];
  };
  const out = [];
  out.push(
    time('wrappers.offsetParent x' + wrappers.length, () => wrappers.reduce((a, w) => a + (w.offsetParent ? 1 : 0), 0)),
  );
  out.push(time('wrappers.getClientRects', () => wrappers.reduce((a, w) => a + w.getClientRects().length, 0)));
  out.push(
    time('wrappers.getBoundingClientRect', () => wrappers.reduce((a, w) => a + w.getBoundingClientRect().width, 0)),
  );
  out.push(time('wrappers.offsetWidth', () => wrappers.reduce((a, w) => a + w.offsetWidth, 0)));
  out.push(time('wrappers.offsetWidth again', () => wrappers.reduce((a, w) => a + w.offsetWidth, 0)));
  out.push(
    time('ports.getBoundingClientRect x' + ports.length, () =>
      ports.reduce((a, w) => a + w.getBoundingClientRect().width, 0),
    ),
  );
  out.push(time('ports.offsetLeft', () => ports.reduce((a, w) => a + w.offsetLeft, 0)));
  // interleaved write/read on different elements (layout thrash pattern)
  out.push(
    time('interleaved style write + offsetWidth (500)', () => {
      let a = 0;
      for (let i = 0; i < 500; i++) {
        wrappers[i].style.minHeight = i % 2 ? '1px' : '0px';
        a += wrappers[i + 1].offsetWidth;
      }
      return a;
    }),
  );
  out.push(
    time('only visible wrappers offsetWidth', () =>
      wrappers
        .filter((w) => w.parentElement.parentElement.style.display !== 'none')
        .reduce((a, w) => a + w.offsetWidth, 0),
    ),
  );
  // culled hosts: what does a read on a display:none subtree cost?
  const culled = wrappers.filter((w) => w.parentElement.parentElement.style.display === 'none');
  out.push(
    time('culled wrappers.getClientRects x' + culled.length, () =>
      culled.reduce((a, w) => a + w.getClientRects().length, 0),
    ),
  );
  out.push(time('culled wrappers.offsetParent', () => culled.reduce((a, w) => a + (w.offsetParent ? 1 : 0), 0)));
  return out;
});
console.log(JSON.stringify(r, null, 0));
await browser.close();
