// Usage: node heap.mjs <baseUrl>  — loads the virtualization demo, takes a heap snapshot, aggregates by constructor.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, openSync, writeSync, closeSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4201';
const harness = readFileSync(new URL('./harness.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const cdp = await browser.contexts()[0].newCDPSession(page);
await page.goto(base + '/introduction/overview', { waitUntil: 'networkidle' });
await page.evaluate(harness);
console.log(JSON.stringify(await page.evaluate(() => __perf.gotoAndWait('/performance/virtualization'))));
await cdp.send('HeapProfiler.enable');
await cdp.send('HeapProfiler.collectGarbage');
const file = new URL('./snapshot.heapsnapshot', import.meta.url).pathname;
const fd = openSync(file, 'w');
cdp.on('HeapProfiler.addHeapSnapshotChunk', (e) => writeSync(fd, e.chunk));
await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });
closeSync(fd);
await browser.close();

const buf = readFileSync(file);
// The file is larger than a JS string can hold: scan bytes.
const metaKey = Buffer.from('"snapshot":'); const metaStart = buf.indexOf(metaKey) + metaKey.length;
let depth = 0, i = metaStart;
for (; i < buf.length; i++) { const c = buf[i]; if (c === 123) depth++; else if (c === 125) { depth--; if (depth === 0) break; } }
const meta = JSON.parse(buf.toString('utf8', metaStart, i + 1)).meta;
const nodesKey = Buffer.from('"nodes":['); const nodesStart = buf.indexOf(nodesKey, i) + nodesKey.length;
const nodes = [];
let num = 0, inNum = false;
for (let p = nodesStart; p < buf.length; p++) { const c = buf[p]; if (c >= 48 && c <= 57) { num = num * 10 + (c - 48); inNum = true; } else { if (inNum) { nodes.push(num); num = 0; inNum = false; } if (c === 93) break; } }
const stringsKey = Buffer.from('"strings":['); const stringsStart = buf.lastIndexOf(stringsKey) + stringsKey.length - 1;
const strings = JSON.parse(buf.toString('utf8', stringsStart, buf.length - 1));
const F = meta.node_fields.length;
const iType = meta.node_fields.indexOf('type'), iName = meta.node_fields.indexOf('name'), iSize = meta.node_fields.indexOf('self_size');
const typeNames = meta.node_types[iType];
const agg = new Map();
let total = 0;
for (let n = 0; n < nodes.length; n += F) {
  const type = typeNames[nodes[n + iType]];
  const size = nodes[n + iSize];
  total += size;
  const name = type === 'object' ? strings[nodes[n + iName]] : type === 'closure' ? '(closure)' : type === 'array' ? '(array:' + strings[nodes[n + iName]] + ')' : '(' + type + ')';
  const e = agg.get(name) ?? { count: 0, size: 0 };
  e.count++; e.size += size; agg.set(name, e);
}
console.log('total MB', (total / 1e6).toFixed(1), 'objects', nodes.length / F);
for (const [k, v] of [...agg.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 55)) console.log((v.size / 1e6).toFixed(1).padStart(7), 'MB', String(v.count).padStart(8), k);
