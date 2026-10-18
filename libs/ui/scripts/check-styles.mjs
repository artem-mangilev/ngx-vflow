// Checks the design-system discipline of the parts and that both published CSS entries style them.
// 1. Every class in a part is a utility Tailwind generated from the `vui` scales (the default theme is not
//    imported, so `p-3`, `text-xs` or a typo fail here instead of silently doing nothing).
// 2. Arbitrary values are limited to the allowlist below: system colors, SVG properties without utilities and
//    named geometric constants. Everything else comes from a scale.
// 3. The stylesheet generates nothing else: a word in a source comment that Tailwind takes for a utility
//    (`grid`, `ring`) would ship as a global class, so it must be excluded with `@source not inline(...)`.
// 4. dist/libs/ui/styles.source.css, compiled the way a consumer's Tailwind v4 pipeline would, generates
//    every utility the parts use. Byte equality with styles.css is not expected: without a prefix Tailwind
//    also picks words from source comments, which the published code no longer has.
// 5. The stylesheets the CLI delivers, ui-preset.css and ui-theme.css after a full `@import 'tailwindcss'`, generate
//    every utility the parts use: the path of an application that copies the parts.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const dist = join(root, 'dist/libs/ui');
const sources = ['libs/ui/src/lib'].flatMap((dir) =>
  readdirSync(join(root, dir))
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
    .map((file) => join(dir, file)),
);

const SYSTEM_COLORS = /^\[(ButtonText|Canvas|CanvasText|Highlight)\]$/;
const ARBITRARY_PROPERTIES = /^\[(stroke-linejoin|forced-color-adjust):[^\]]+\]$/;
// A part may point its local variable at a theme token, e.g. the status tone: `[--vui-tone:var(--vui-success)]`.
const LOCAL_TOKENS = /^\[--vui-[\w-]+:var\(--vui-[\w-]+\)\]$/;
const ALLOWED = new Map([["content-['']", 'generated content of a pseudo-element']]);
// Classes of other packages that part selectors refer to, e.g. the core node host in the port reveal rule.
const EXTERNAL_CLASSES = new Set(['v-node']);

/** Class lists are the `class:` host values and the upper-case constants they interpolate. */
function classTokens(file) {
  const text = readFileSync(join(root, file), 'utf8');
  const lists = [...text.matchAll(/(?:class:\s*|const [A-Z_]+ =\s*)([`'])([\s\S]*?)\1/g)].map((m) => m[2]);
  return lists
    .flatMap((list) => list.replace(/\$\{[^}]*\}/g, ' ').split(/\s+/))
    .filter((token) => token && !token.startsWith('vui-'));
}

/** The utility after the variants: `data-[vui-selected=true]:outline-2` → `outline-2`. */
function utilityOf(token) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    if (char === '[' || char === '(') depth++;
    else if (char === ']' || char === ')') depth--;
    else if (char === ':' && depth === 0) start = i + 1;
  }
  return token.slice(start);
}

function arbitraryError(utility) {
  if (ALLOWED.has(utility)) return null;
  if (ARBITRARY_PROPERTIES.test(utility)) return null;
  if (LOCAL_TOKENS.test(utility)) return null;
  const value = /^[\w-]*?-?(\[.*\])$/.exec(utility)?.[1];
  if (value && !SYSTEM_COLORS.test(value)) return 'arbitrary value outside the allowlist; use a vui scale';
  const variable = /-\((--[\w-]+)\)$/.exec(utility)?.[1];
  if (variable && !variable.startsWith('--vui-')) return 'arbitrary variable outside the vui tokens';
  return null;
}

/** Class names in the selectors of a stylesheet; comments, declarations and at-rule preludes are skipped. */
function generatedClasses(css) {
  const selectors = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(?:^|[{};])([^{};]+)(?=\{)/g)]
    .map((m) => m[1].trim())
    .filter((prelude) => !prelude.startsWith('@'));
  return new Set(
    selectors.flatMap((selector) =>
      [...selector.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => m[1].replace(/\\(.)/g, '$1')),
    ),
  );
}

const compiled = generatedClasses(readFileSync(join(dist, 'styles.css'), 'utf8'));
const errors = [];
const used = new Set();
for (const file of sources) {
  for (const token of classTokens(file)) {
    used.add(token);
    const arbitrary = arbitraryError(utilityOf(token));
    if (arbitrary) errors.push(`${file}: ${token}: ${arbitrary}`);
    else if (!compiled.has(token)) errors.push(`${file}: ${token}: not generated, not a utility of the vui scales`);
  }
}

for (const name of compiled) {
  if (!used.has(name) && !name.startsWith('vui-') && !EXTERNAL_CLASSES.has(name)) {
    errors.push(`styles.css: .${name}: generated but used by no part; exclude the word with @source not inline(...)`);
  }
}

// Inside dist, so `@import 'tailwindcss'` resolves from the workspace node_modules.
const consumer = mkdtempSync(join(dist, 'consumer-'));
try {
  const entry = join(consumer, 'styles.css');
  writeFileSync(entry, `@import '${join(dist, 'styles.source.css')}';\n`);
  execFileSync('npx', ['tailwindcss', '-i', entry, '-o', join(consumer, 'out.css'), '--minify'], {
    cwd: root,
    stdio: 'inherit',
  });
  const fromSource = generatedClasses(readFileSync(join(consumer, 'out.css'), 'utf8'));
  for (const token of used) {
    if (compiled.has(token) && !fromSource.has(token)) errors.push(`styles.source.css: ${token}: not generated`);
  }

  const copied = join(consumer, 'copied.css');
  const src = join(root, 'libs/ui/src');
  writeFileSync(
    copied,
    [
      "@import 'tailwindcss' source(none);",
      `@import '${join(src, 'ui-preset.css')}';`,
      `@import '${join(src, 'ui-theme.css')}';`,
      `@source '${join(src, 'lib')}';`,
    ].join('\n'),
  );
  execFileSync('npx', ['tailwindcss', '-i', copied, '-o', join(consumer, 'copied.out.css'), '--minify'], {
    cwd: root,
    stdio: 'inherit',
  });
  const fromCopied = generatedClasses(readFileSync(join(consumer, 'copied.out.css'), 'utf8'));
  for (const token of used) {
    if (compiled.has(token) && !fromCopied.has(token)) errors.push(`ui-preset.css: ${token}: not generated`);
  }
} finally {
  rmSync(consumer, { recursive: true, force: true });
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Parts use ${used.size} utilities, all from the vui scales and generated by every CSS entry.`);
