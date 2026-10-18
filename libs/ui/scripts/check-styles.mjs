// Checks the design-system discipline of the parts and that the stylesheets the CLI delivers style them.
// 1. Every class in a part is a utility Tailwind generated from the `vui` scales (the default theme is not
//    imported, so `p-3`, `text-xs` or a typo fail here instead of silently doing nothing).
// 2. Arbitrary values are limited to the allowlist below: system colors, SVG properties without utilities and
//    named geometric constants. Everything else comes from a scale.
// 3. The stylesheet generates nothing else: a word in a source comment that Tailwind takes for a utility
//    (`grid`, `ring`) would ship as a global class, so it must be excluded with `@source not inline(...)`.
// 4. The stylesheets the CLI delivers, ui-preset.css and ui-theme.css after a full `@import 'tailwindcss'`, generate
//    every utility the parts use: the path of an application that copies the parts.
// 5. ui-theme.css sets the same tokens in the light and the dark theme, so a theme never falls back to the other.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
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

// In the ignored tmp/ of the workspace, so `@import 'tailwindcss'` resolves from its node_modules.
mkdirSync(join(root, 'tmp'), { recursive: true });
const work = mkdtempSync(join(root, 'tmp/check-styles-'));
const tailwind = (input, output) =>
  execFileSync('npx', ['tailwindcss', '-i', input, '-o', output, '--minify'], { cwd: root, stdio: 'inherit' });

let compiled;
try {
  tailwind(join(root, 'libs/ui/src/styles.css'), join(work, 'styles.css'));
  compiled = generatedClasses(readFileSync(join(work, 'styles.css'), 'utf8'));
} catch (error) {
  rmSync(work, { recursive: true, force: true });
  throw error;
}
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

try {
  const copied = join(work, 'copied.css');
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
  tailwind(copied, join(work, 'copied.out.css'));
  const fromCopied = generatedClasses(readFileSync(join(work, 'copied.out.css'), 'utf8'));
  for (const token of used) {
    if (compiled.has(token) && !fromCopied.has(token)) errors.push(`ui-preset.css: ${token}: not generated`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

const themeCss = readFileSync(join(root, 'libs/ui/src/ui-theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const themeTokens = (theme) => {
  const block = [...themeCss.matchAll(/([^{}]+)\{([^}]*)\}/g)].find(([, selector]) =>
    selector.includes(`[data-vui-theme='${theme}']`),
  );
  return new Set([...(block?.[2] ?? '').matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
};
const [light, dark] = [themeTokens('light'), themeTokens('dark')];
for (const [theme, own, other] of [
  ['dark', dark, light],
  ['light', light, dark],
]) {
  for (const token of other) if (!own.has(token)) errors.push(`ui-theme.css: the ${theme} theme does not set ${token}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `Parts use ${used.size} utilities, all from the vui scales and generated by the library entry and by the preset after Tailwind.`,
);
