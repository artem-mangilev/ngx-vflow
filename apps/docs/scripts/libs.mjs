// The docs take the libraries the way an application does: as the packages built into dist/libs with the Angular
// version of the workspace root, and the @vflow/ui parts as sources. Both live outside apps/docs, where imports of
// `@angular/core` would resolve to the Angular of the root, so they are copied to apps/docs/libs: there the same
// imports resolve to the Angular of the docs, and the dev server watches the copies like any file of the project.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, rmdirSync, watch, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const workspaceRoot = resolve(docsRoot, '../..');

/** Libraries built with ng-packagr; the order is the build order (the others compile against the built core). */
export const packages = ['ngx-vflow', 'routing', 'auto-size', 'layout'];

/**
 * ng-packagr stamps the manifest of every watch build with a new version (`0.0.0-watch+<time>`). The copy keeps
 * one version, so a build that changed nothing else leaves the copy as it is: the dev server takes a changed
 * manifest for a changed configuration and generates every page again.
 */
function stableManifest(file, content) {
  if (file !== 'package.json') return content;

  return Buffer.from(content.toString().replace(/("version": "0\.0\.0-watch)\+\d+"/, '$1"'));
}

/**
 * What is copied where. A package without `package.json` is not built yet (ng-packagr deletes the package first and
 * writes the manifest of its primary entry point after the bundles), so the previous copy stays.
 */
export const mirrors = [
  ...packages.map((name) => ({
    name,
    source: join(workspaceRoot, 'dist/libs', name),
    target: join(docsRoot, 'libs', name),
    complete: 'package.json',
    stable: stableManifest,
  })),
  { name: 'ui', source: join(workspaceRoot, 'libs/ui/src'), target: join(docsRoot, 'libs/ui') },
];

function filesIn(dir, base = dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesIn(join(dir, entry.name), base) : [relative(base, join(dir, entry.name))],
  );
}

function removeEmptyDirs(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyDirs(join(dir, entry.name));
  }
  if (!readdirSync(dir).length) rmdirSync(dir);
}

/**
 * Makes the target equal to the source. Only files with other content are written, so a rebuild that changes one
 * bundle does not make the dev server recompile everything.
 * @returns the written and removed files, or `undefined` if the source is not complete.
 */
export function syncMirror({ source, target, complete, stable }) {
  if (!existsSync(complete ? join(source, complete) : source)) return undefined;

  const changed = [];
  const files = filesIn(source);
  for (const file of files) {
    const original = readFileSync(join(source, file));
    const content = stable ? stable(file, original) : original;
    const to = join(target, file);
    if (existsSync(to) && readFileSync(to).equals(content)) continue;
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, content);
    changed.push(file);
  }
  const expected = new Set(files);
  for (const file of filesIn(target)) {
    if (expected.has(file)) continue;
    rmSync(join(target, file));
    changed.push(file);
  }
  if (existsSync(target)) removeEmptyDirs(target);

  return changed;
}

/** Copies everything once. Returns the names of the mirrors whose source is missing. */
export function syncAll(log = console.log) {
  const missing = [];
  for (const mirror of mirrors) {
    if (!syncAndReport(mirror, log)) missing.push(mirror.name);
  }

  return missing;
}

/** Copies one mirror and reports what changed. Returns `false` if its source is not complete. */
export function syncAndReport(mirror, log = console.log) {
  const changed = syncMirror(mirror);
  if (changed?.length) {
    const files = changed.length > 3 ? `${changed.length} files` : changed.join(', ');
    log(`${mirror.name}: ${files} updated`);
  }

  return changed !== undefined;
}

/**
 * Copies a mirror again after files of its source change; a burst of writes is copied once, after it settles.
 * For sources edited by hand. A package is copied when its build completes instead (see dev.mjs): while
 * ng-packagr writes, the files in dist do not belong to one build.
 * @returns a function that stops watching.
 */
export function watchMirror(mirror, log = console.log, settleMs = 100) {
  let timer;
  const watcher = watch(mirror.source, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => syncAndReport(mirror, log), settleMs);
  });

  return () => watcher.close();
}
