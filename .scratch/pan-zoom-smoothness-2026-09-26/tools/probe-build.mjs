// Checks whether the running dev server serves a build containing a token, e.g. a new class name.
// Usage: node probe-build.mjs <baseUrl> <token>
const base = process.argv[2] ?? 'http://localhost:4200';
const token = process.argv[3] ?? 'ViewportCullingDirective';
const seen = new Set();
async function fetchText(path) {
  const res = await fetch(base + path);
  return res.ok ? res.text() : '';
}
const html = await fetchText('/');
const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
const queue = scripts.map((s) => (s.startsWith('/') ? s : '/' + s));
let found = null;
while (queue.length && !found) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const text = await fetchText(path);
  if (text.includes(token)) found = path;
  for (const m of text.matchAll(/(?:from|import)\s*\(?\s*"((?:\.?\/)?chunk-[^"]+\.js)"/g)) {
    const rel = '/' + m[1].replace(/^\.?\//, '');
    if (!seen.has(rel)) queue.push(rel);
  }
  if (seen.size > 400) break;
}
console.log(JSON.stringify({ token, found, filesChecked: seen.size }));
