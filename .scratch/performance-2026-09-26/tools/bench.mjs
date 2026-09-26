// Repeated benchmark without the sampling profiler. Each iteration uses a fresh browser context.
// Usage: node bench.mjs <baseUrl> [iterations=5] [scenarios=load,pan,drag,zoom,zoomout] [page=/performance/virtualization] [expected=4900]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4300';
const iterations = Number(process.argv[3] ?? 5);
const scenarios = (process.argv[4] ?? 'load,pan,drag,zoom,zoomout').split(',');
const demo = process.argv[5] ?? '/performance/virtualization';
const expected = Number(process.argv[6] ?? 4900);
const harness = readFileSync(new URL('./harness.js', import.meta.url), 'utf8');

const browser = await chromium.launch({ headless: true, args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const rows = [];
for (let i = 0; i < iterations; i++) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  await page.goto(base + '/introduction/overview', { waitUntil: 'networkidle' });
  await page.evaluate(harness);
  await page.evaluate(() => __perf.sleep(300));
  const row = {};
  for (const s of scenarios) {
    const m0 = await metrics();
    const expr = {
      load: `__perf.gotoAndWait('${demo}', ${expected})`,
      pan: '__perf.pan()',
      drag: '__perf.drag()',
      zoom: '__perf.zoom()',
      zoomout: '__perf.zoom(40, 40)',
    }[s];
    const r = await page.evaluate(expr);
    const m1 = await metrics();
    row[s + '.taskMs'] = Math.round((m1.TaskDuration - m0.TaskDuration) * 1000);
    row[s + '.scriptMs'] = Math.round((m1.ScriptDuration - m0.ScriptDuration) * 1000);
    row[s + '.recalcMs'] = Math.round((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000);
    row[s + '.layoutMs'] = Math.round((m1.LayoutDuration - m0.LayoutDuration) * 1000);
    row[s + '.longMs'] = r.loaf.totalLongMs;
    row[s + '.maxFrame'] = r.loaf.maxFrameMs;
    if (s === 'load') {
      row['load.readyMs'] = r.readyMs;
      row['load.allNodesMs'] = r.allNodesMs;
      row['load.dom'] = r.dom;
      await cdp.send('HeapProfiler.collectGarbage');
      row['load.heapMB'] = Math.round((await metrics()).JSHeapUsedSize / 1e5) / 10;
    } else {
      row[s + '.p90'] = r.p90;
    }
  }
  rows.push(row);
  await context.close();
}
await browser.close();
const keys = Object.keys(rows[0]);
const med = (xs) => { const a = [...xs].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
const out = {};
for (const k of keys) { const xs = rows.map((r) => r[k]); out[k] = { med: med(xs), min: Math.min(...xs), max: Math.max(...xs) }; }
console.log(JSON.stringify({ base, iterations, out }));
for (const k of keys) console.log(k.padEnd(18), String(out[k].med).padStart(8), `  [${out[k].min} .. ${out[k].max}]`);
