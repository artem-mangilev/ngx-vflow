// Records a Chrome trace of the virtualization demo load and summarizes main-thread tasks after navigation.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4300';
const harness = readFileSync(new URL('./harness.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
await page.goto(base + '/introduction/overview', { waitUntil: 'networkidle' });
await page.evaluate(harness);
await page.evaluate(() => __perf.sleep(300));
await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] });
await page.evaluate(() => {
  // Timestamps of readiness milestones, as user timing marks.
  const seen = new Set();
  const poll = () => {
    const ns = document.querySelectorAll('.vflow-node');
    if (ns.length && !seen.has('nodes')) {
      seen.add('nodes');
      performance.mark('m:nodes');
    }
    if (ns.length) {
      const hidden = [...ns].filter((n) => n.style.display !== 'none' && n.style.visibility === 'hidden').length;
      const shown = [...ns].filter((n) => n.style.display !== 'none').length;
      const key = `h${hidden}-s${shown}`;
      if (!seen.has(key)) {
        seen.add(key);
        performance.mark('m:' + key);
      }
    }
    if (seen.size < 40) requestAnimationFrame(poll);
  };
  window.__poll = poll;
});
const nav = await page.evaluate(() => {
  performance.mark('nav');
  requestAnimationFrame(__poll);
  return __perf.gotoAndWait('/performance/virtualization');
});
const buf = await browser.stopTracing();
const events = JSON.parse(buf.toString()).traceEvents;
await browser.close();
const mainPid = events.find((e) => e.name === 'TracingStartedInBrowser')?.args?.data?.frames?.[0]?.processId;
const markEv = events.find((e) => e.name === 'nav' && e.cat.includes('blink.user_timing'));
const threadName = new Map(
  events.filter((e) => e.name === 'thread_name').map((e) => [`${e.pid}:${e.tid}`, e.args.name]),
);
const main = events.filter(
  (e) => threadName.get(`${e.pid}:${e.tid}`) === 'CrRendererMain' && (!mainPid || e.pid === mainPid),
);
const tasks = main.filter((e) => e.name === 'RunTask' && e.ph === 'X').sort((a, b) => a.ts - b.ts);
const t0 = markEv ? markEv.ts : tasks[0].ts;
const within = (outer, e) => e.ts >= outer.ts && e.ts + (e.dur ?? 0) <= outer.ts + outer.dur;
const interesting = new Set([
  'FunctionCall',
  'FireAnimationFrame',
  'Layout',
  'UpdateLayoutTree',
  'ResizeObserverLoopCallbacks',
  'TimerFire',
  'EventDispatch',
  'Paint',
  'PrePaint',
  'Layerize',
  'RunMicrotasks',
  'v8.run',
  'ParseHTML',
  'UpdateLayerTree',
  'HitTest',
  'Commit',
  'ScheduleStyleRecalculation',
]);
const children = main.filter((e) => e.ph === 'X' && interesting.has(e.name));
console.log(JSON.stringify({ readyMs: nav.readyMs, allNodesMs: nav.allNodesMs }));
for (const m of events
  .filter((e) => e.cat.includes('blink.user_timing') && String(e.name).startsWith('m:'))
  .sort((a, b) => a.ts - b.ts))
  console.log(`   mark ${((m.ts - t0) / 1000).toFixed(0).padStart(6)}ms ${m.name}`);
for (const t of tasks) {
  const start = (t.ts - t0) / 1000;
  if (start < -5 || t.dur < 8000) continue;
  const kids = children.filter((c) => within(t, c));
  const agg = {};
  for (const k of kids) agg[k.name] = (agg[k.name] || 0) + k.dur / 1000;
  // only top-level-ish breakdown
  console.log(
    `${start.toFixed(0).padStart(6)}ms  task ${(t.dur / 1000).toFixed(0).padStart(5)}ms  ` +
      Object.entries(agg)
        .filter(([, v]) => v > 2)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}=${v.toFixed(0)}`)
        .join(' '),
  );
}
