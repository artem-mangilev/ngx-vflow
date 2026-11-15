// Finds lockfile snapshots that mix the two toolchains: Angular 20 + TypeScript 5 + Vitest 3 + Vite 7 (libraries)
// and Angular 22 + TypeScript 6 + Vitest 4 + Vite 8 (docs). Run from the repository root:
//   node .scratch/workspace-deps-2026-11-15/tools/mixed-toolchains.cjs
// @nx/eslint with typescript 6 is its own dependency, not a mix.
const fs = require('fs');
/** The `snapshots` section of pnpm-lock.yaml: key -> { dependencies, optionalDependencies }. */
function readSnapshots(file) {
  const snapshots = {};
  let inside = false,
    key,
    section;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (/^\S/.test(line)) {
      inside = line.startsWith('snapshots:');
      continue;
    }
    if (!inside || !line.trim()) continue;
    const indent = line.length - line.trimStart().length;
    const text = line.trim();
    if (indent === 2) {
      key = text.replace(/:( \{\})?$/, '').replace(/^'|'$/g, '');
      snapshots[key] = {};
    } else if (indent === 4) {
      section = text.replace(/:$/, '');
      snapshots[key][section] = {};
    } else if (indent === 6 && section) {
      const at = text.indexOf(': ');
      snapshots[key][section][text.slice(0, at).replace(/^'|'$/g, '')] = text.slice(at + 2).replace(/^'|'$/g, '');
    }
  }
  return snapshots;
}
const lock = { snapshots: readSnapshots(process.argv[2] ?? 'pnpm-lock.yaml') };
const side = (name, version) => {
  const major = Number(version.split('.')[0]);
  if (/^@angular\/|^@angular-devkit\/|^@schematics\/|^ng-packagr$/.test(name)) {
    const m = name === '@angular-devkit/architect' ? Math.floor(Number(version.split('.')[1]) / 100) : major;
    return m === 20 ? 'libs' : m === 22 ? 'docs' : undefined;
  }
  if (name === 'typescript') return major === 5 ? 'libs' : 'docs';
  if (name === 'vitest' || name.startsWith('@vitest/')) return major === 3 ? 'libs' : 'docs';
  if (name === 'vite') return major === 7 ? 'libs' : major === 8 ? 'docs' : undefined;
  return undefined;
};
const sidesOf = (text) => {
  const found = { libs: new Set(), docs: new Set() };
  for (const [, name, version] of text.matchAll(/((?:@[\w.-]+\/)?[\w.-]+)@(\d+\.\d+\.\d+[\w.-]*)/g)) {
    const s = side(name, version);
    if (s) found[s].add(`${name}@${version}`);
  }
  return found;
};
const mixed = [];
for (const [key, snap] of Object.entries(lock.snapshots)) {
  const deps = { ...snap.dependencies, ...snap.optionalDependencies };
  const text =
    key +
    ' ' +
    Object.entries(deps)
      .map(([n, v]) => `${n}@${v}`)
      .join(' ');
  const found = sidesOf(text);
  if (found.libs.size && found.docs.size)
    mixed.push({ key: key.replace(/\(.*/, ''), libs: [...found.libs], docs: [...found.docs] });
}
const byKey = {};
for (const m of mixed) (byKey[m.key] ??= []).push(m);
for (const [key, items] of Object.entries(byKey)) {
  console.log(key, 'x' + items.length);
  console.log('   libs side:', [...new Set(items.flatMap((i) => i.libs))].join(' '));
  console.log('   docs side:', [...new Set(items.flatMap((i) => i.docs))].join(' '));
}
console.log('mixed snapshots:', mixed.length, 'of', Object.keys(lock.snapshots).length);
