// Run from the repository root: node .scratch/workspace-deps-2026-11-15/tools/undeclared-imports.cjs
// For every package in the pnpm store: bare imports of packages that are kept out of the fallback folder
// (they exist in two versions) and that the package does not declare.
const fs = require('fs');
const path = require('path');
const store = path.join(process.argv[2] ?? process.cwd(), 'node_modules/.pnpm');
const split =
  /^(@angular\/[\w-]+|@angular-devkit\/[\w-]+|@schematics\/[\w-]+|@analogjs\/[\w-]+|ng-packagr|typescript|vite|vitest|@vitest\/[\w-]+)(\/|$)/;
const result = {};
const walk = (dir, out, depth = 0) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && depth < 6) walk(p, out, depth + 1);
    } else if (/\.(m?js|cjs)$/.test(e.name) && fs.statSync(p).size < 3e6) out.push(p);
  }
};
for (const entry of fs.readdirSync(store)) {
  if (entry === 'node_modules' || entry.startsWith('.')) continue;
  const nm = path.join(store, entry, 'node_modules');
  if (!fs.existsSync(nm)) continue;
  const name = entry.startsWith('@') ? entry.split('@')[1].replace('+', '/') : entry.split('@')[0];
  const pkgName = entry.startsWith('@') ? '@' + name : name;
  const dir = path.join(nm, pkgName);
  if (!fs.existsSync(path.join(dir, 'package.json'))) continue;
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const declared = new Set([
    m.name,
    ...Object.keys({ ...m.dependencies, ...m.peerDependencies, ...m.optionalDependencies }),
  ]);
  const files = [];
  walk(dir, files);
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    for (const [, spec] of text.matchAll(
      /(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)["']([^"'.\n][^"'\n]*)["']/g,
    )) {
      const hit = split.exec(spec);
      if (hit && !declared.has(hit[1])) (result[m.name + '@' + m.version] ??= new Set()).add(hit[1]);
    }
  }
}
for (const [k, v] of Object.entries(result).sort()) console.log(k, '->', [...v].sort().join(', '));
