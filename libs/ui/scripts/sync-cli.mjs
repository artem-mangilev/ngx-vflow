// Copies the sources of @vflow/ui into the templates of @vflow/cli, like spartan's hlm-to-cli generator: the parts
// become the files of the `ui` generator and vflow-ui.css the tokens file that `init` copies.
// The copies are verbatim (the parts import each other relatively), so a consumer gets the code docs and e2e run on.
// `cli:build` and `cli:test` run it first, so the package and the tests always use the current parts.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ui = join(root, 'libs/ui/src');
const cli = join(root, 'libs/cli');
// Directories owned by this script: a file in them without a source is stale.
const partsDir = join(cli, 'src/generators/ui/files');

/** Target path → source path. Templates take the `.template` suffix so the CLI project does not compile them. */
const expected = new Map([
  [join(partsDir, 'src/index.ts.template'), join(ui, 'public-api.ts')],
  [join(cli, 'src/generators/init/vflow-ui.css'), join(ui, 'vflow-ui.css')],
]);
for (const file of readdirSync(join(ui, 'lib'))) {
  if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
    expected.set(join(partsDir, 'src/lib', `${file}.template`), join(ui, 'lib', file));
  }
}

function filesIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesIn(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

for (const [target, source] of expected) {
  const content = readFileSync(source, 'utf8');
  if (existsSync(target) && readFileSync(target, 'utf8') === content) continue;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}
for (const file of filesIn(partsDir)) {
  if (!expected.has(file)) rmSync(file);
}
console.log(`Wrote ${expected.size} CLI templates.`);
