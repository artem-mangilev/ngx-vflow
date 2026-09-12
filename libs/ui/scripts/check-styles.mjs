// Verifies that both published CSS entries give the same stylesheet.
// It compiles dist/libs/ui/styles.source.css the way a consumer's Tailwind v4 pipeline would,
// from a directory outside the workspace sources, and compares the result with styles.css.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const dist = join(root, 'dist/libs/ui');
const consumer = mkdtempSync(join(tmpdir(), 'vflow-ui-consumer-'));

try {
  const entry = join(consumer, 'styles.css');
  writeFileSync(entry, `@import '${join(dist, 'styles.source.css')}';\n`);
  execFileSync('npx', ['tailwindcss', '-i', entry, '-o', join(consumer, 'out.css'), '--minify'], {
    cwd: root,
    stdio: 'inherit',
  });
  const compiled = readFileSync(join(dist, 'styles.css'), 'utf8');
  const fromSource = readFileSync(join(consumer, 'out.css'), 'utf8');
  const classes = (css) => new Set(css.match(/\.vui\\:[^{,\s]+/g) ?? []);
  const missing = [...classes(compiled)].filter((name) => !classes(fromSource).has(name));
  if (missing.length) {
    throw new Error(
      `styles.source.css did not produce ${missing.length} utilities, e.g. ${missing.slice(0, 5).join(' ')}`,
    );
  }
  if (compiled !== fromSource) {
    throw new Error('styles.source.css compiles to a different stylesheet than styles.css');
  }
  console.log(`Both CSS entries match: ${classes(compiled).size} utilities, ${compiled.length} bytes.`);
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
