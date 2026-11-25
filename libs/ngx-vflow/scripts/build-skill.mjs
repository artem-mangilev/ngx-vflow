// Builds the agent skill shipped in the package (skills/ngx-vflow): SKILL.md is agent-skill.md plus an index of the
// docs pages, and references/ holds one Markdown file per page with the code of its demos in place of the demo panes.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const categories = resolve(root, '../../apps/docs/src/app/categories');
const shared = resolve(root, '../../apps/docs/src/app/shared/flow-presentations.ts');
const out = join(root, 'skills/ngx-vflow');
const site = 'https://www.ngx-vflow.org';

const read = (path) => readFileSync(path, 'utf8');
const field = (source, name) => source.match(new RegExp(`${name}:\\s*(['"\`])(.*?)\\1`))?.[2];
const order = (source) => Number(source.match(/order:\s*(\d+)/)?.[1] ?? 999);

/** The category tree under `dir`, ordered as the docs sidebar orders it. */
function tree(dir) {
  const children = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'demo') continue;
    const path = join(dir, entry.name);
    const page = join(path, 'ng-doc.page.ts');
    const category = join(path, 'ng-doc.category.ts');
    if (existsSync(page)) {
      const source = read(page);
      children.push({ page: true, dir: path, source, title: field(source, 'title'), order: order(source) });
    } else if (existsSync(category)) {
      const source = read(category);
      children.push({ dir: path, title: field(source, 'title'), order: order(source), children: tree(path) });
    }
  }
  return children.sort((a, b) => a.order - b.order);
}

const route = (dir) => relative(categories, dir);
const pages = new Set();
const collect = (nodes) => nodes.forEach((n) => (n.page ? pages.add(route(n.dir)) : collect(n.children)));
const sections = tree(categories);
collect(sections);

/** `import { A, B } from './x'` → Map of A and B to the resolved file of './x'. */
function localImports(file) {
  const map = new Map();
  for (const [, names, from] of read(file).matchAll(/import\s*\{([^}]*)\}\s*from\s*'(\.[^']*)'/g)) {
    const path = resolve(dirname(file), from.endsWith('.ts') ? from : `${from}.ts`);
    for (const name of names
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean))
      map.set(name, path);
  }
  return map;
}

/** The demo file and the local files it imports, each once per page. */
function demoCode(file, seen) {
  if (seen.has(file) || !existsSync(file)) return '';
  seen.add(file);
  const own = `\`${relative(categories, file)}\`:\n\n\`\`\`ts\n${read(file).trimEnd()}\n\`\`\`\n`;
  const deps = [...new Set(localImports(file).values())].map((dep) => demoCode(dep, seen)).join('\n');
  return deps ? `${own}\n${deps}` : own;
}

function render(page) {
  const ref = `references/${route(page.dir)}.md`;
  const demos = localImports(join(page.dir, 'ng-doc.page.ts'));
  const seen = new Set();
  const md = read(join(page.dir, field(page.source, 'mdFile') ?? 'index.md'))
    .replace(/^\{%\s*(end)?raw\s*%\}\n\n?/gm, '')
    .replace(/\{\{\s*NgDocActions\.demo(?:Pane)?\("(\w+)".*?\}\}/g, (match, name) => {
      const file = demos.get(name);
      if (!file) throw new Error(`${route(page.dir)}: no import for demo ${name}`);
      return `Demo \`${name}\`, ${demoCode(file, seen)}`;
    })
    // Links to other pages point at their references; anything else stays a link to the site.
    .replace(/\]\(\/([\w/-]+)(#[\w-]+)?\)/g, (match, path, hash = '') =>
      pages.has(path) ? `](${relative(dirname(ref), `references/${path}.md`)}${hash})` : `](${site}/${path}${hash})`,
    );
  if (/NgDocActions|\{%/.test(md)) throw new Error(`${ref}: NgDoc markup left`);
  const file = join(out, ref);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `# ${page.title}\n\nOnline: ${site}/${route(page.dir)}\n\n${md.trim()}\n`);
  return { ref, md };
}

/** One index line: the link, the first sentence of the page and its sections. */
function entry(page, { ref, md }) {
  const paragraph = md.split(/\n\n/).find((p) => /^[A-Za-z`*]/.test(p.trim()) && !p.startsWith('#')) ?? '';
  // Link targets are relative to the page, not to SKILL.md, so the index keeps only their text.
  const sentence =
    paragraph
      .replace(/\s+/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .match(/^.*?\.(?=\s|$)/)?.[0] ?? '';
  const headings = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const sectionsText = headings.length ? ` Sections: ${headings.join('; ')}.` : '';
  return `- [${page.title}](${ref}): ${sentence}${sectionsText}`;
}

function index(nodes, depth) {
  return nodes
    .map((node) =>
      node.page
        ? entry(node, render(node))
        : `\n${'#'.repeat(depth)} ${node.title}\n\n${index(node.children, depth + 1).trim()}`,
    )
    .join('\n');
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'references'), { recursive: true });
const body = index(sections, 3);
writeFileSync(
  join(out, 'references/docs-shared.md'),
  `# Docs presentations\n\nThe \`@docs/shared\` presentations the demos use.\n\n\`\`\`ts\n${read(shared).trimEnd()}\n\`\`\`\n`,
);
writeFileSync(join(out, 'SKILL.md'), `${read(join(root, 'agent-skill.md')).trimEnd()}\n\n## Index\n${body}\n`);

// Every relative link of the skill resolves to a file of the skill.
for (const file of readdirSync(out, { recursive: true }).filter((f) => f.endsWith('.md'))) {
  const path = join(out, file);
  for (const [, target] of read(path).matchAll(/\]\(([^)#\s:]+\.md)(?:#[^)]*)?\)/g)) {
    if (!existsSync(resolve(dirname(path), target))) throw new Error(`${file}: broken link ${target}`);
  }
}
