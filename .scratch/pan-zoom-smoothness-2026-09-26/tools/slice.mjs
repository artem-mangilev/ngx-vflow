// Prints the events of the renderer main, compositor, raster and GPU threads inside a time window of a saved trace.
// Usage: node slice.mjs <trace.json> <phaseMark> <fromMs> <toMs> [minDurMs=0.05]
import { readFileSync } from 'node:fs';
const [file, phase, fromMs, toMs, minDur = '0.05'] = process.argv.slice(2);
const events = JSON.parse(readFileSync(file, 'utf8')).traceEvents;
const threadName = new Map(events.filter((e) => e.name === 'thread_name').map((e) => [`${e.pid}:${e.tid}`, e.args.name]));
const rendererPid = events.find((e) => e.name === 'TracingStartedInBrowser')?.args?.data?.frames?.[0]?.processId;
const markTs = {};
for (const e of events) if ((e.cat || '').includes('blink.user_timing') && /^t:/.test(e.name)) markTs[e.name.slice(2)] = e.ts;
const t0 = markTs[phase] + Number(fromMs) * 1000;
const t1 = markTs[phase] + Number(toMs) * 1000;
const want = (e) => {
  const tn = threadName.get(`${e.pid}:${e.tid}`) || '';
  if (e.pid === rendererPid) return /^(CrRendererMain|Compositor|CompositorTileWorker.*|ThreadPoolForegroundWorker)$/.test(tn) ? tn : null;
  if (/^(CrGpuMain|VizCompositorThread)$/.test(tn)) return 'gpu:' + tn;
  return null;
};
const rows = [];
for (const e of events) {
  if (e.ph !== 'X' && e.ph !== 'I' && e.ph !== 'b' && e.ph !== 'e') continue;
  const tn = want(e);
  if (!tn) continue;
  if (e.ts < t0 || e.ts > t1) continue;
  if (e.ph === 'X' && (e.dur || 0) / 1000 < Number(minDur)) continue;
  rows.push({ tn, ts: e.ts, dur: e.dur || 0, name: e.name, ph: e.ph, args: e.args });
}
rows.sort((a, b) => a.ts - b.ts || b.dur - a.dur);
const stacks = new Map();
for (const r of rows) {
  const st = stacks.get(r.tn) || [];
  while (st.length && st[st.length - 1] <= r.ts) st.pop();
  const depth = st.length;
  if (r.ph === 'X') st.push(r.ts + r.dur);
  stacks.set(r.tn, st);
  const extra = r.name === 'UpdateLayoutTree' ? ` elements=${r.args?.elementCount}` : r.name === 'Paint' ? ` layer=${r.args?.data?.layerId} clip=${JSON.stringify(r.args?.data?.clip)}` : r.name === 'PipelineReporter' ? ` ${JSON.stringify(r.args).slice(0, 160)}` : r.name === 'FunctionCall' ? ` ${r.args?.data?.functionName}:${r.args?.data?.lineNumber}` : r.name === 'EventDispatch' ? ` ${r.args?.data?.type}` : r.name === 'TimerFire' ? ` id=${r.args?.data?.timerId}` : '';
  console.log(`${((r.ts - markTs[phase]) / 1000).toFixed(2).padStart(9)} ${r.tn.padEnd(24)} ${'  '.repeat(Math.min(depth, 8))}${r.name} ${r.ph === 'X' ? (r.dur / 1000).toFixed(2) + 'ms' : r.ph}${extra}`);
}
