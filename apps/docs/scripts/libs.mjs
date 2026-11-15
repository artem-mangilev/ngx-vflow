// The docs take the libraries the way an application does: as the packages built into libs/<name>/dist with the Angular
// version of the libraries, and the @vflow/ui parts as sources. Both live outside apps/docs, where imports of
// `@angular/core` would resolve to the Angular of the root, so `docs:libs` copies them to apps/docs/libs: there the
// same imports resolve to the Angular of the docs, and the dev server watches the copies like any file of the project.
//
// Nx builds the packages before this script runs (`docs:libs` depends on `^build`).
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');

/** What is copied, by the name of its folder in apps/docs/libs. */
const sources = {
  'ngx-vflow': 'libs/ngx-vflow/dist',
  routing: 'libs/routing/dist',
  'auto-size': 'libs/auto-size/dist',
  layout: 'libs/layout/dist',
  ui: 'libs/ui/src',
};

function filesIn(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)));
}

/**
 * Makes the target equal to the source. Only files with other content are written, so a rebuild that changes one
 * bundle does not make the dev server compile everything again.
 * @returns the number of written and removed files.
 */
function sync(source, target) {
  let changed = 0;
  const files = filesIn(source);
  for (const file of files) {
    const content = readFileSync(join(source, file));
    const to = join(target, file);
    if (existsSync(to) && readFileSync(to).equals(content)) continue;
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, content);
    changed++;
  }
  const expected = new Set(files);
  for (const file of filesIn(target)) {
    if (expected.has(file)) continue;
    rmSync(join(target, file));
    changed++;
  }

  return changed;
}

for (const [name, path] of Object.entries(sources)) {
  const source = join(workspaceRoot, path);
  if (!existsSync(source)) {
    console.error(`${path} does not exist. Run \`pnpm nx run docs:libs\`: it builds the libraries first.`);
    process.exit(1);
  }
  const changed = sync(source, join(docsRoot, 'libs', name));
  if (changed) console.log(`${name}: ${changed} ${changed === 1 ? 'file' : 'files'} updated`);
}
