// Usage: node profile.mjs <baseUrl> [scenarios=load,pan,drag,zoom] [pathsFor=isValidLink,...]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4201';
const scenarios = (process.argv[3] ?? 'load,pan,drag,zoom').split(',');
const pathsFor = (process.argv[4] ?? '').split(',').filter(Boolean);
const harness = readFileSync(new URL('./harness.js', import.meta.url), 'utf8');

const SKIP =
  /producerAccessed|isValidLink|signalGetFn|computed2|producerUpdateValueVersion|producerRecomputeValue|consumerPollProducersForChange|consumerBeforeComputation|consumerAfterComputation|runEffect|^$|__spread|consumerMarkDirty|producerNotifyConsumers|forEach|^map$|^filter$|^every$|^find$|^some$|^sort$|detectChangesIn|refreshView|executeTemplate|synchronize|tickImpl|_tick|^tick$|^run$|^execute$|runOutsideAngular|maybeTrace|phaseFn|invoke|onInvoke|runTask|invokeTask|drainMicroTaskQueue|ZoneDelegate|runGuarded|checkStable|onLeave|onEnter|onHasTask|scheduleTask|Promise|ZoneAwarePromise|resolvePromise|scheduleResolveOrReject|then/;

function aggregate(profile) {
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  const key = (n) =>
    `${n.callFrame.functionName || '(anon)'} @ ${(n.callFrame.url || '').split('/').pop().split('?')[0]}:${n.callFrame.lineNumber + 1}`;
  const self = new Map(),
    incl = new Map();
  let total = 0;
  const samples = profile.samples,
    deltas = profile.timeDeltas;
  for (let i = 0; i < samples.length; i++) {
    const dt = (deltas[i] ?? 0) / 1000;
    total += dt;
    const node = byId.get(samples[i]);
    const k = key(node);
    self.set(k, (self.get(k) || 0) + dt);
    const seen = new Set();
    let id = node.id;
    while (id !== undefined) {
      const kk = key(byId.get(id));
      if (!seen.has(kk)) {
        seen.add(kk);
        incl.set(kk, (incl.get(kk) || 0) + dt);
      }
      id = parent.get(id);
    }
  }
  const top = (m, n) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => [Math.round(v), k]);
  const paths = (leafMatch, depth = 9, n = 4) => {
    const acc = new Map();
    for (let i = 0; i < samples.length; i++) {
      const dt = (deltas[i] ?? 0) / 1000;
      const node = byId.get(samples[i]);
      if (!key(node).includes(leafMatch)) continue;
      const parts = [];
      let id = node.id;
      while (id !== undefined && parts.length < depth) {
        const cf = byId.get(id).callFrame;
        const name = cf.functionName || '(anon)';
        if (!SKIP.test(name)) parts.push(`${name}:${cf.lineNumber + 1}`);
        id = parent.get(id);
      }
      const k = parts.reverse().join(' > ');
      acc.set(k, (acc.get(k) || 0) + dt);
    }
    return [...acc.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => [Math.round(v), k]);
  };
  const byFile = new Map();
  for (const [k, v] of self) {
    const f = k.split(' @ ')[1].split(':')[0] || '(native)';
    byFile.set(f, (byFile.get(f) || 0) + v);
  }
  const libSelf = [...self.entries()]
    .filter(([k]) => process.env.LIB_CHUNK && k.includes(process.env.LIB_CHUNK))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([k, v]) => [Math.round(v), k]);
  return {
    totalMs: Math.round(total),
    self: top(self, 18),
    incl: top(incl, 40),
    byFile: top(byFile, 12),
    libSelf,
    paths,
  };
}

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('pageerror', e.message));
const cdp = await context.newCDPSession(page);
await cdp.send('Performance.enable');
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
const metrics = async () =>
  Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const delta = (a, b) => ({
  layouts: b.LayoutCount - a.LayoutCount,
  recalcs: b.RecalcStyleCount - a.RecalcStyleCount,
  layoutMs: Math.round((b.LayoutDuration - a.LayoutDuration) * 1000),
  recalcMs: Math.round((b.RecalcStyleDuration - a.RecalcStyleDuration) * 1000),
  scriptMs: Math.round((b.ScriptDuration - a.ScriptDuration) * 1000),
  taskMs: Math.round((b.TaskDuration - a.TaskDuration) * 1000),
  jsHeapMB: Math.round(b.JSHeapUsedSize / 1e6),
});

await page.goto(base + '/introduction/overview', { waitUntil: 'networkidle' });
await page.evaluate(harness);
await page.evaluate(() => __perf.sleep(500));
console.log(JSON.stringify({ base, idleFrames: await page.evaluate(() => __perf.idle(500)) }));

async function measured(name, expr) {
  const m0 = await metrics();
  await cdp.send('Profiler.start');
  const t0 = Date.now();
  const r = await page.evaluate(expr);
  const wallMs = Date.now() - t0;
  const { profile } = await cdp.send('Profiler.stop');
  const m1 = await metrics();
  const agg = aggregate(profile);
  const out = {
    scenario: name,
    wallMs,
    result: r,
    cdp: delta(m0, m1),
    profile: { totalMs: agg.totalMs, self: agg.self, incl: agg.incl, byFile: agg.byFile, libSelf: agg.libSelf },
  };
  if (pathsFor.length) out.paths = Object.fromEntries(pathsFor.map((l) => [l, agg.paths(l)]));
  console.log(JSON.stringify(out));
}

for (const s of scenarios) {
  if (s === 'load') await measured('load', "__perf.gotoAndWait('/performance/virtualization')");
  if (s === 'pan') await measured('pan', '__perf.pan()');
  if (s === 'drag') await measured('drag', '__perf.drag()');
  if (s === 'zoom') await measured('zoom', '__perf.zoom()');
  if (s === 'zoomout') await measured('zoomout', '__perf.zoom(40, 40)');
  if (s === 'zoom3') await measured('zoom3', '__perf.zoom(20, -40)');
  if (s === 'pan3') await measured('pan3', '__perf.pan(90, 6, 4, 7)');
  if (s === 'stress') await measured('stress-load', "__perf.gotoAndWait('/performance/stress-test', 1024)");
  if (s === 'stresspan') await measured('stress-pan', '__perf.pan()');
  if (s === 'stressdrag') await measured('stress-drag', '__perf.drag()');
  if (s === 'debug')
    console.log(
      JSON.stringify(
        await page.evaluate(() => {
          const pr = __perf.pane().getBoundingClientRect();
          const ns = [...document.querySelectorAll('.vflow-node')].filter((n) => n.style.display !== 'none');
          return {
            pane: pr,
            visible: ns.length,
            rects: ns.slice(0, 4).map((n) => {
              const b = n.getBoundingClientRect();
              return [n.style.visibility, b.left, b.top, b.width, b.height];
            }),
            viewport: __perf.viewport(),
          };
        }),
      ),
    );
  if (s === 'shotdemo')
    await page
      .locator('.vflow-pane')
      .first()
      .screenshot({ path: new URL('./demo.png', import.meta.url).pathname });
  if (s === 'screenshot') await page.screenshot({ path: new URL('./shot.png', import.meta.url).pathname });
}
await browser.close();
