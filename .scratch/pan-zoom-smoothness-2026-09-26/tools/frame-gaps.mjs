// For a phase of a saved trace: per-phase main/raster/GPU busy, and the longest intervals between main-thread frames
// with the main-thread busy time inside each, to tell a busy main thread from a stalled pipeline.
// Usage: node frame-gaps.mjs <trace.json> <phase> [nextPhase=end] [top=8]
import { readFileSync } from 'node:fs';
const [file, phase, nextPhase = 'end', top = '8'] = process.argv.slice(2);
const events = JSON.parse(readFileSync(file, 'utf8')).traceEvents;
const threadName = new Map(events.filter((e) => e.name === 'thread_name').map((e) => [`${e.pid}:${e.tid}`, e.args.name]));
const rendererPid = events.find((e) => e.name === 'TracingStartedInBrowser')?.args?.data?.frames?.[0]?.processId;
const marks = {};
for (const e of events) if ((e.cat || '').includes('blink.user_timing') && /^t:/.test(e.name)) marks[e.name.slice(2)] = e.ts;
const a = marks[phase], b = marks[nextPhase];
const X = events.filter((e) => e.ph === 'X' && e.ts >= a && e.ts <= b);
const tn = (e) => threadName.get(`${e.pid}:${e.tid}`) || '';
const main = X.filter((e) => e.pid === rendererPid && tn(e) === 'CrRendererMain');
const mainTasks = main.filter((e) => e.name === 'RunTask').sort((x, y) => x.ts - y.ts);
const raster = X.filter((e) => e.pid === rendererPid && /CompositorTileWorker|ThreadPoolForegroundWorker/.test(tn(e)) && /RasterTask|RasterizerTaskImpl::RunOnWorkerThread/.test(e.name) && e.name !== 'RasterTask');
const gpu = X.filter((e) => /^CrGpuMain$/.test(tn(e)) && e.name === 'GPUTask');
const viz = X.filter((e) => /VizCompositorThread/.test(tn(e)) && /DisplayScheduler::DrawAndSwap|Graphics.Pipeline/.test(e.name));
const sum = (xs) => xs.reduce((s, e) => s + e.dur / 1000, 0);
const ms = (b - a) / 1000;
console.log(JSON.stringify({ phase, ms: Math.round(ms), mainBusyMs: Math.round(sum(mainTasks)), rasterBusyMs: Math.round(sum(raster)), rasterTasks: raster.length, gpuBusyMs: Math.round(sum(gpu)), vizDrawSwapMs: Math.round(sum(viz)) }));
const frames = main.filter((e) => e.name === 'ProxyMain::BeginMainFrame').sort((x, y) => x.ts - y.ts);
const gaps = [];
for (let i = 1; i < frames.length; i++) {
  const t0 = frames[i - 1].ts, t1 = frames[i].ts;
  const busy = mainTasks.filter((t) => t.ts >= t0 && t.ts < t1).reduce((s, t) => s + Math.min(t.dur, t1 - t.ts) / 1000, 0);
  const rasterIn = raster.filter((t) => t.ts + t.dur >= t0 && t.ts <= t1).reduce((s, t) => s + t.dur / 1000, 0);
  const gpuIn = gpu.filter((t) => t.ts + t.dur >= t0 && t.ts <= t1).reduce((s, t) => s + t.dur / 1000, 0);
  gaps.push({ at: Math.round((t0 - a) / 1000), gap: Math.round((t1 - t0) / 100) / 10, mainBusy: Math.round(busy * 10) / 10, raster: Math.round(rasterIn), gpu: Math.round(gpuIn) });
}
gaps.sort((x, y) => y.gap - x.gap);
console.log('longest gaps between main frames (ms): at gap mainBusy rasterBusy(all workers) gpuBusy');
for (const g of gaps.slice(0, Number(top))) console.log(`  ${g.at}ms gap=${g.gap} main=${g.mainBusy} raster=${g.raster} gpu=${g.gpu}`);
