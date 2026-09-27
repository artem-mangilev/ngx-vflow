// CPU profile of the demo load, split into phases at idle gaps; prints busy phases with their top frames.
// Usage: node phases.mjs <baseUrl> [minPhaseMs=20]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4201';
const minPhase = Number(process.argv[3] ?? 20);
const harness = readFileSync(new URL('./harness.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
await page.goto(base + '/introduction/overview', { waitUntil: 'networkidle' });
await page.evaluate(harness);
await page.evaluate(() => __perf.sleep(300));
await cdp.send('Profiler.start');
const nav = await page.evaluate(() => __perf.gotoAndWait('/performance/virtualization'));
const { profile } = await cdp.send('Profiler.stop');
await browser.close();
console.log(JSON.stringify({ readyMs: nav.readyMs, allNodesMs: nav.allNodesMs }));

const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const name = (n) => `${n.callFrame.functionName || '(anon)'}:${n.callFrame.lineNumber + 1}`;
const NOISE =
  /^(\(root\)|\(program\)|\(idle\)|\(garbage collector\)|\(anon\)|producer|consumer|signal|computed2|isValidLink|runEffect|detectChanges|refreshView|executeTemplate|synchronize|tickImpl|_tick|tick|run|execute|runOutsideAngular|maybeTrace|phaseFn|invoke|onInvoke|runTask|invokeTask|ZoneDelegate|AfterRenderEffectSequence|__spread|forEach|map|filter|Subscriber|OperatorSubscriber|next|_next|emit)/;
// chronological samples
let t = 0;
const samples = profile.samples.map((id, i) => {
  t += profile.timeDeltas[i] / 1000;
  return { t, id, dt: (profile.timeDeltas[i + 1] ?? 0) / 1000 };
});
const isIdle = (s) => ['(idle)', '(program)'].includes(byId.get(s.id).callFrame.functionName);
// phases: runs of busy samples separated by >= 2ms idle
const phases = [];
let cur = null,
  idleRun = 0;
for (const s of samples) {
  if (isIdle(s)) {
    idleRun += s.dt;
    if (cur && idleRun >= 2) {
      phases.push(cur);
      cur = null;
    }
    continue;
  }
  idleRun = 0;
  if (!cur) cur = { start: s.t, end: s.t, samples: [] };
  cur.end = s.t + s.dt;
  cur.samples.push(s);
}
if (cur) phases.push(cur);
const t0 = phases.find((p) => p.end - p.start > 300)?.start ?? 0;
for (const p of phases) {
  const dur = p.samples.reduce((a, s) => a + s.dt, 0);
  if (dur < minPhase || p.start < t0 - 1) continue;
  const incl = new Map(),
    self = new Map();
  for (const s of p.samples) {
    const leaf = byId.get(s.id);
    self.set(name(leaf), (self.get(name(leaf)) || 0) + s.dt);
    const seen = new Set();
    for (let id = s.id; id !== undefined; id = parent.get(id)) {
      const k = name(byId.get(id));
      if (NOISE.test(k) || seen.has(k)) continue;
      seen.add(k);
      incl.set(k, (incl.get(k) || 0) + s.dt);
    }
  }
  const top = (m, n) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => `${k}=${v.toFixed(0)}`)
      .join('  ');
  console.log(`\n@${(p.start - t0).toFixed(0)}ms  busy ${dur.toFixed(0)}ms`);
  console.log('  incl: ' + top(incl, 14));
  console.log('  self: ' + top(self, 8));
}
