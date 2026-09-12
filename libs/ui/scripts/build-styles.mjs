// Produces both CSS entries of @vflow/ui from the single source stylesheet.
// - styles.css: compiled by Tailwind here; consumers need no Tailwind.
// - styles.source.css: the same source with `@source` pointing at the published package code,
//   for consumers who compile it with their own Tailwind v4 pipeline.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const source = join(root, 'libs/ui/src/styles.css');
const dist = join(root, 'dist/libs/ui');
const workspaceSource = "@source './lib';\n@source '../bpmn/src';";
const publishedSource = "@source './fesm2022';";

mkdirSync(dist, { recursive: true });
execFileSync('npx', ['tailwindcss', '-i', source, '-o', join(dist, 'styles.css'), '--minify'], {
  cwd: root,
  stdio: 'inherit',
});

const css = readFileSync(source, 'utf8');
if (!css.includes(workspaceSource)) throw new Error(`styles.css must contain ${workspaceSource}`);
writeFileSync(join(dist, 'styles.source.css'), css.replace(workspaceSource, publishedSource));
