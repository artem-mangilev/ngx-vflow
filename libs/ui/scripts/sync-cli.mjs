// Copies the sources of @vflow/ui into the templates of @vflow/cli, like spartan's hlm-to-cli generator: the parts
// become the files of the `ui` generator and the two stylesheets become the preset and the theme of `ui-theme`.
// The copies are verbatim (the parts import each other relatively), so a consumer gets the code docs and e2e run on.
// `--check` writes nothing and fails when a template differs from its source or has no source, or when the parts do
// not compile with `isolatedModules`, which a new Angular application turns on.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ui = join(root, 'libs/ui/src');
const cli = join(root, 'libs/cli');
// Directories owned by this script: a file in them without a source is stale.
const partsDir = join(cli, 'src/generators/ui/files');
const check = process.argv.includes('--check');

/** Target path → source path. Templates take the `.template` suffix so the CLI project does not compile them. */
const expected = new Map([
  [join(partsDir, 'src/index.ts.template'), join(ui, 'public-api.ts')],
  [join(cli, 'ui-preset.css'), join(ui, 'ui-preset.css')],
  [join(cli, 'src/generators/ui-theme/ui-theme.css'), join(ui, 'ui-theme.css')],
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

const problems = [];
for (const [target, source] of expected) {
  const content = readFileSync(source, 'utf8');
  if (existsSync(target) && readFileSync(target, 'utf8') === content) continue;
  if (check) problems.push(`${relative(root, target)}: differs from ${relative(root, source)}`);
  else {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}
for (const file of filesIn(partsDir)) {
  if (expected.has(file)) continue;
  if (check) problems.push(`${relative(root, file)}: no source in libs/ui`);
  else rmSync(file);
}

if (check) problems.push(...isolatedModulesErrors());

/** Type errors of the parts under the root tsconfig with `isolatedModules`, such as a type re-exported without `type`. */
function isolatedModulesErrors() {
  const config = ts.getParsedCommandLineOfConfigFile(
    join(root, 'tsconfig.json'),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
  );
  const parts = [join(ui, 'public-api.ts'), ...readdirSync(join(ui, 'lib')).map((file) => join(ui, 'lib', file))];
  const program = ts.createProgram(parts, { ...config.options, isolatedModules: true, noEmit: true });
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName.startsWith(ui))
    .map((diagnostic) => {
      const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
      return `${relative(root, diagnostic.file.fileName)}:${line + 1}: TS${diagnostic.code} ${message}`;
    });
}

if (problems.length) {
  console.error(`${problems.join('\n')}\nRun \`nx run ui:sync-cli\` and commit the result.`);
  process.exit(1);
}
console.log(
  check
    ? `${expected.size} CLI templates match libs/ui, and the parts compile with isolatedModules.`
    : `Wrote ${expected.size} CLI templates.`,
);
