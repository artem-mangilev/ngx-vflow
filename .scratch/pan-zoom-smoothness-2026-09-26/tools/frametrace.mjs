// Frame-level trace of pan and zoom gestures with real (CDP) input.
// Usage: node frametrace.mjs <baseUrl> <path> [scenario] [options as KEY=VALUE]
//   scenario: zoompan (default) | pan | zoom | zoomout | wheelpan | zoomoutpan (zoom in to ZOOM, out to ZOOM_OUT, pan)
//   options: HEADED=1 (real GPU raster), ZOOM=3 (target zoom before pan), STEPS=90, INTERVAL=7 (ms between input
//            events), DX=6 DY=4 (pan step, css px), WHEEL=-10 (deltaY per wheel event), BIG=1 (grow the demo pane),
//            FLOW=<index of .vflow-pane on the page>, TRACE=path.json (keep the raw trace), CSS=<extra css>
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4200';
const path = process.argv[3] ?? '/introduction/overview';
const scenario = process.argv[4] ?? 'zoompan';
const opt = Object.fromEntries(process.argv.slice(5).map((a) => a.split('=')));
const env = (k, d) => (opt[k] ?? process.env[k] ?? d);
const HEADED = !!env('HEADED', '');
const ZOOM = Number(env('ZOOM', 3));
const ZOOM_OUT = Number(env('ZOOM_OUT', 0.5));
const STEPS = Number(env('STEPS', 90));
const INTERVAL = Number(env('INTERVAL', 7));
const DX = Number(env('DX', 6));
const DY = Number(env('DY', 4));
const WHEEL = Number(env('WHEEL', -10));
const BIG = !!env('BIG', '');
const FLOW = Number(env('FLOW', 0));
const TRACE = env('TRACE', '');
const CSS = env('CSS', '');
const DPR = Number(env('DPR', 1));
const VW = Number(env('VW', 1400));
const VH = Number(env('VH', 900));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  headless: !HEADED,
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--enable-gpu-rasterization'],
});
const context = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto(base + path, { waitUntil: 'networkidle' });
if (BIG)
  await page.addStyleTag({
    content:
      'main { max-width: none !important; } .ng-doc-sidenav-wrapper, .ng-doc-sidenav-content, article.ngde, .ng-doc-page-wrapper, ng-doc-page { max-width: none !important; width: auto !important; } ng-doc-page-wrapper { display: block !important; } ng-doc-demo-pane, ng-doc-pane, .ng-doc-pane-front, .ng-doc-pane-content { height: 900px !important; }',
  });
if (CSS) await page.addStyleTag({ content: CSS });

const pane = page.locator('.vflow-pane').nth(FLOW);
await pane.waitFor();
await pane.scrollIntoViewIfNeeded();
// Wait until every node of this flow is measured.
await page.waitForFunction(
  (i) => {
    const root = document.querySelectorAll('.vflow-pane')[i]?.closest('.vflow-root');
    if (!root) return false;
    const nodes = [...root.querySelectorAll('.vflow-node')];
    return nodes.length > 0 && nodes.every((n) => n.style.display === 'none' || n.style.visibility !== 'hidden');
  },
  FLOW,
  { timeout: 20000 },
);
await sleep(500);
const box = await pane.boundingBox();
const cx = Math.round(box.x + box.width / 2);
const cy = Math.round(box.y + box.height / 2);
const info = await page.evaluate((i) => {
  const root = document.querySelectorAll('.vflow-pane')[i].closest('.vflow-root');
  return {
    nodes: root.querySelectorAll('.vflow-node').length,
    edges: root.querySelectorAll('svg[edge]').length,
    dom: root.querySelectorAll('*').length,
    pageDom: document.querySelectorAll('*').length,
    viewport: root.querySelector('.vflow-viewport').style.transform,
    dpr: devicePixelRatio,
    background: !!root.querySelector('.vflow-background-svg pattern'),
  };
}, FLOW);
console.log(JSON.stringify({ base, path, scenario, pane: { w: box.width, h: box.height }, ...info, HEADED, ZOOM, STEPS, INTERVAL }));

// In-page frame recorder.
await page.evaluate(() => {
  window.__rec = { intervals: [], loaf: [], samples: [], running: true, last: performance.now(), frame: 0 };
  const tick = () => {
    const n = performance.now();
    window.__rec.intervals.push([n, n - window.__rec.last]);
    window.__rec.last = n;
    if (window.__rec.frame++ % 6 === 0) {
      let displayed = 0;
      let hidden = 0;
      for (const node of document.querySelectorAll('.vflow-node')) {
        if (node.style.display === 'none') continue;
        displayed++;
        if (node.style.visibility === 'hidden') hidden++;
      }
      window.__rec.samples.push([n, displayed, hidden]);
    }
    if (window.__rec.running) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.__rec.obs = new PerformanceObserver((l) => window.__rec.loaf.push(...l.getEntries().map((e) => e.duration)));
  window.__rec.obs.observe({ type: 'long-animation-frame', buffered: false });
});
await sleep(300);
await page.evaluate(() => { window.__rec.intervals.length = 0; window.__rec.loaf.length = 0; window.__rec.samples.length = 0; });

await browser.startTracing(page, {
  categories: [
    'devtools.timeline',
    'disabled-by-default-devtools.timeline',
    'disabled-by-default-devtools.timeline.frame',
    'benchmark',
    'cc',
    'viz',
    'input',
    'blink.user_timing',
  ],
});
await page.evaluate(() => performance.mark('t:start'));

async function wheelTo(zoomTarget, deltaY = WHEEL) {
  await page.mouse.move(cx, cy);
  const factor = Math.pow(2, -deltaY * 0.002);
  let zoom = await page.evaluate((i) => {
    const m = /scale\(([\d.]+)\)/.exec(document.querySelectorAll('.vflow-pane')[i].closest('.vflow-root').querySelector('.vflow-viewport').style.transform);
    return m ? Number(m[1]) : 1;
  }, FLOW);
  let n = 0;
  while ((factor > 1 ? zoom < zoomTarget - 1e-6 : zoom > zoomTarget + 1e-6) && n < 400) {
    await page.mouse.wheel(0, deltaY);
    zoom *= factor;
    n++;
    await sleep(INTERVAL);
  }
  return n;
}
/** A point of the pane near its center that hits neither a node nor an edge stroke, so a press pans the viewport. */
async function emptyPoint() {
  return page.evaluate(
    ([i, cx, cy]) => {
      const paneEl = document.querySelectorAll('.vflow-pane')[i];
      const pr = paneEl.getBoundingClientRect();
      const free = (x, y) => {
        const el = document.elementFromPoint(x, y);
        return !!el && !el.closest('.vflow-node') && !el.closest('svg[edge]') && !!el.closest('.vflow-pane');
      };
      for (let r = 0; r < 400; r += 6) {
        for (let a = 0; a < 360; a += 30) {
          const x = Math.round(cx + r * Math.cos((a * Math.PI) / 180));
          const y = Math.round(cy + r * Math.sin((a * Math.PI) / 180));
          if (x > pr.left + 20 && x < pr.right - 20 && y > pr.top + 20 && y < pr.bottom - 20 && free(x, y)) return { x, y };
        }
      }
      return { x: cx, y: cy };
    },
    [FLOW, cx, cy],
  );
}
async function pan(steps = STEPS) {
  const from = await emptyPoint();
  console.log(JSON.stringify({ pressAt: from, hit: await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className?.toString().slice(0, 40), [from.x, from.y]) }));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + DX * i, from.y + DY * i);
    await sleep(INTERVAL);
  }
  await page.mouse.up();
}

const marks = {};
const mark = async (name) => {
  marks[name] = await page.evaluate((n) => { performance.mark('t:' + n); return performance.now(); }, name);
};

if (scenario === 'zoompan' || scenario === 'pan') {
  if (scenario === 'zoompan') {
    await mark('zoom');
    const n = await wheelTo(ZOOM);
    console.log(JSON.stringify({ wheelEvents: n }));
    await sleep(400);
  }
  await mark('pan');
  await pan();
  await sleep(300);
  await mark('end');
} else if (scenario === 'zoom') {
  await mark('zoom');
  await wheelTo(ZOOM);
  await sleep(400);
  await mark('end');
} else if (scenario === 'zoomout') {
  await wheelTo(ZOOM);
  await sleep(400);
  await mark('zoom');
  await wheelTo(1, -WHEEL);
  await sleep(400);
  await mark('end');
} else if (scenario === 'zoomoutpan') {
  await wheelTo(ZOOM);
  await sleep(600);
  await mark('zoomout');
  const n = await wheelTo(ZOOM_OUT, -WHEEL);
  await sleep(600);
  // Displayed nodes against the nodes whose box really touches the pane: the index must not over-report.
  const check = await page.evaluate((i) => {
    const paneEl = document.querySelectorAll('.vflow-pane')[i];
    const root = paneEl.closest('.vflow-root');
    const pr = paneEl.getBoundingClientRect();
    let displayed = 0;
    let touching = 0;
    for (const node of root.querySelectorAll('.vflow-node')) {
      if (node.style.display === 'none') continue;
      displayed++;
      const r = node.getBoundingClientRect();
      if (r.right >= pr.left && r.left <= pr.right && r.bottom >= pr.top && r.top <= pr.bottom) touching++;
    }
    const edges = [...root.querySelectorAll('svg[edge]')].filter((e) => e.style.display !== 'none').length;
    return { displayedNodes: displayed, touchingNodes: touching, displayedEdges: edges };
  }, FLOW);
  console.log(JSON.stringify({ wheelEventsOut: n, ...check }));
  await mark('pan');
  await pan();
  await sleep(300);
  await mark('end');
} else if (scenario === 'wheelpan') {
  await wheelTo(ZOOM);
  await sleep(400);
  await mark('pan');
  await page.mouse.move(cx, cy);
  for (let i = 0; i < STEPS; i++) {
    await page.mouse.wheel(DX, DY);
    await sleep(INTERVAL);
  }
  await sleep(300);
  await mark('end');
}

await page.evaluate(() => performance.mark('t:stop'));
const buf = await browser.stopTracing();
const rec = await page.evaluate(() => {
  window.__rec.running = false;
  window.__rec.obs.disconnect();
  return { intervals: window.__rec.intervals, loaf: window.__rec.loaf, samples: window.__rec.samples, now: performance.now() };
});
marks.stop = rec.now;
const finalViewport = await page.evaluate((i) => document.querySelectorAll('.vflow-pane')[i].closest('.vflow-root').querySelector('.vflow-viewport').style.transform, FLOW);
await browser.close();

if (TRACE) writeFileSync(TRACE, buf);
const events = JSON.parse(buf.toString()).traceEvents;

// ---- rAF intervals
const ivt = rec.intervals.slice(2);
const iv = ivt.map(([, dt]) => dt);
const sorted = [...iv].sort((a, b) => a - b);
const q = (p) => Math.round((sorted[Math.floor(sorted.length * p)] ?? 0) * 10) / 10;
const median = q(0.5);
const dropped = iv.filter((x) => x > median * 1.6).length;
console.log(
  JSON.stringify({
    finalViewport,
    rafFrames: iv.length,
    p50: median,
    p90: q(0.9),
    p99: q(0.99),
    max: Math.round(Math.max(...iv)),
    droppedFrames: dropped,
    over12ms: iv.filter((x) => x > 12).length,
    over20ms: iv.filter((x) => x > 20).length,
    loaf: rec.loaf.length,
    loafMax: Math.round(Math.max(0, ...rec.loaf)),
  }),
);
{
  // Dropped frames by phase, with the worst ones located relative to the phase start.
  const phaseNames = Object.keys(marks).sort((a, b) => marks[a] - marks[b]);
  const out = {};
  for (let i = 0; i < phaseNames.length - 1; i++) {
    const [a, b] = [marks[phaseNames[i]], marks[phaseNames[i + 1]]];
    const inPhase = ivt.filter(([t]) => t >= a && t < b);
    const bad = inPhase.filter(([, dt]) => dt > median * 1.6);
    const samples = rec.samples.filter(([t]) => t >= a && t < b);
    out[phaseNames[i]] = {
      frames: inPhase.length,
      dropped: bad.length,
      displayed: samples.length ? [samples[0][1], samples[samples.length - 1][1]] : null,
      maxHiddenVisibility: samples.length ? Math.max(...samples.map((x) => x[2])) : null,
      worst: bad
        .sort((x, y) => y[1] - x[1])
        .slice(0, 8)
        .map(([t, dt]) => `${Math.round(t - a)}ms:${Math.round(dt)}`),
    };
  }
  console.log(JSON.stringify({ droppedByPhase: out }));
}

// ---- Trace analysis
const threadName = new Map(events.filter((e) => e.name === 'thread_name').map((e) => [`${e.pid}:${e.tid}`, e.args.name]));
const procName = new Map(events.filter((e) => e.name === 'process_name').map((e) => [e.pid, e.args.name]));
const rendererPid = events.find((e) => e.name === 'TracingStartedInBrowser')?.args?.data?.frames?.[0]?.processId;
const tStart = events.find((e) => e.name === 't:start' && (e.cat || '').includes('blink.user_timing'))?.ts;
const tStop = events.find((e) => e.name === 't:stop' && (e.cat || '').includes('blink.user_timing'))?.ts;
const markTs = {};
for (const e of events) if ((e.cat || '').includes('blink.user_timing') && /^t:/.test(e.name)) markTs[e.name.slice(2)] = e.ts;
const inWindow = (e) => e.ts >= tStart && e.ts <= tStop;
const byThread = (nameMatch, pid) =>
  events.filter((e) => e.ph === 'X' && (pid ? e.pid === pid : true) && nameMatch.test(threadName.get(`${e.pid}:${e.tid}`) || '') && inWindow(e));

const main = byThread(/^CrRendererMain$/, rendererPid);
const compositor = byThread(/^Compositor$/, rendererPid);
const raster = byThread(/CompositorTileWorker|ThreadPoolForegroundWorker/, rendererPid);
const gpuMain = byThread(/^CrGpuMain$|VizCompositorThread/);

function sumBy(evs, filter) {
  const acc = new Map();
  for (const e of evs) {
    if (filter && !filter(e)) continue;
    acc.set(e.name, (acc.get(e.name) || 0) + (e.dur || 0) / 1000);
  }
  return [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => [Math.round(v * 10) / 10, k]);
}
const windowMs = (tStop - tStart) / 1000;
const phaseWindows = {};
const names = Object.keys(markTs).filter((n) => !['start', 'stop'].includes(n)).sort((a, b) => markTs[a] - markTs[b]);
for (let i = 0; i < names.length - 1; i++) phaseWindows[names[i]] = [markTs[names[i]], markTs[names[i + 1]]];

const within = (outer, e) => e.ts >= outer.ts && e.ts + (e.dur ?? 0) <= outer.ts + outer.dur;
const interesting = new Set([
  'FunctionCall', 'FireAnimationFrame', 'Layout', 'UpdateLayoutTree', 'TimerFire', 'EventDispatch', 'Paint', 'PrePaint',
  'Layerize', 'RunMicrotasks', 'UpdateLayerTree', 'HitTest', 'Commit', 'ScheduleStyleRecalculation', 'ResizeObserverLoopCallbacks',
]);
const mainTasks = main.filter((e) => e.name === 'RunTask').sort((a, b) => a.ts - b.ts);
const mainChildren = main.filter((e) => interesting.has(e.name));

for (const [phase, [a, b]] of Object.entries(phaseWindows)) {
  const inPhase = (e) => e.ts >= a && e.ts <= b;
  const ms = (b - a) / 1000;
  const mainBusy = mainTasks.filter(inPhase).reduce((s, e) => s + e.dur / 1000, 0);
  const compBusy = compositor.filter(inPhase).filter((e) => !/^(RunTask|ThreadControllerImpl::RunTask|MessagePumpDefault::Run|ThreadController::.*)$/.test(e.name)).reduce((s, e) => s + e.dur / 1000, 0);
  const rasterTasks = raster.filter(inPhase).filter((e) => /Raster|raster/.test(e.name));
  const rasterBusy = rasterTasks.reduce((s, e) => s + e.dur / 1000, 0);
  const paints = mainChildren.filter(inPhase).filter((e) => e.name === 'Paint');
  const recalcs = mainChildren.filter(inPhase).filter((e) => e.name === 'UpdateLayoutTree');
  const layouts = mainChildren.filter(inPhase).filter((e) => e.name === 'Layout');
  // pipeline reporter
  const reporters = events.filter((e) => e.name === 'PipelineReporter' && (e.ph === 'b' || e.ph === 'e') && e.ts >= a && e.ts <= b);
  const states = {};
  for (const r of reporters) {
    const fr = r.args?.chrome_frame_reporter || r.args?.frame_reporter || {};
    const st = fr.state || r.args?.state;
    if (!st) continue;
    const k = st + (fr.affects_smoothness ? '/smooth' : '') + (fr.has_missing_content ? '/missing' : '');
    states[k] = (states[k] || 0) + 1;
  }
  if (!Object.keys(states).length) {
    const sample = events.find((e) => e.name === 'PipelineReporter');
    states.sample = sample ? JSON.stringify(sample.args).slice(0, 300) : 'none';
  }
  const longTasks = mainTasks.filter(inPhase).filter((t) => t.dur > 6000).map((t) => {
    const kids = mainChildren.filter((c) => within(t, c));
    const agg = {};
    for (const k of kids) agg[k.name] = (agg[k.name] || 0) + k.dur / 1000;
    return `${((t.ts - a) / 1000).toFixed(0)}ms ${(t.dur / 1000).toFixed(1)}ms ` + Object.entries(agg).filter(([, v]) => v > 0.5).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k}=${v.toFixed(1)}`).join(' ');
  });
  console.log(
    JSON.stringify({
      phase,
      ms: Math.round(ms),
      main: { busyMs: Math.round(mainBusy), tasks: mainTasks.filter(inPhase).length, paints: paints.length, paintMs: Math.round(paints.reduce((s, e) => s + e.dur / 1000, 0)), recalcs: recalcs.length, recalcMs: Math.round(recalcs.reduce((s, e) => s + e.dur / 1000, 0) * 10) / 10, recalcElements: recalcs.reduce((s, e) => s + (e.args?.elementCount || 0), 0), layouts: layouts.length, layoutMs: Math.round(layouts.reduce((s, e) => s + e.dur / 1000, 0) * 10) / 10, top: sumBy(main.filter(inPhase), (e) => interesting.has(e.name) || /^(RunTask)$/.test(e.name)) },
      compositor: { busyMs: Math.round(compBusy), top: sumBy(compositor.filter(inPhase), (e) => !/^(RunTask|ThreadControllerImpl::RunTask)$/.test(e.name)) },
      raster: { tasks: rasterTasks.length, busyMs: Math.round(rasterBusy), maxMs: Math.round(Math.max(0, ...rasterTasks.map((e) => e.dur / 1000)) * 10) / 10, top: sumBy(raster.filter(inPhase)) },
      gpu: { top: sumBy(gpuMain.filter(inPhase)).slice(0, 6) },
      pipeline: states,
      longTasks: longTasks.slice(0, 12),
    }),
  );
}
