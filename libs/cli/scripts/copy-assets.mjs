// Completes libs/cli/dist after tsc: the manifests and every non-TypeScript file under src (schemas, the part
// templates and the tokens file), so the package has the layout generators.json points at.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

for (const file of ['generators.json', 'README.md', 'LICENSE']) {
  cpSync(join(root, file), join(dist, file));
}
// What the package is built and tested with stays in the workspace, like in the packages ng-packagr builds.
const { devDependencies: _, ...manifest } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
writeFileSync(join(dist, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);

function copyAssets(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) copyAssets(path);
    else if (!entry.name.endsWith('.ts')) cpSync(path, join(dist, relative(root, path)));
  }
}
copyAssets(join(root, 'src'));

// Every copied file as each release wrote it, so a later run can tell an untouched copy of an older release, which it
// updates, from one the application changed, which it keeps; see src/utils/updates.ts. The templates are verbatim
// copies of libs/ui (libs/ui/scripts/sync-cli.mjs), so a release tag holds them as the sources there.
writeFileSync(join(dist, 'released-templates.json'), `${JSON.stringify(releasedTemplates())}\n`);

function releasedTemplates() {
  const repository = resolve(root, '../..');
  const git = (...args) => execFileSync('git', args, { cwd: repository, encoding: 'utf8', maxBuffer: 1 << 26 });
  const hash = (text) => createHash('sha256').update(text.replace(/\r\n/g, '\n').trimEnd()).digest('hex');
  const released = {};
  let tags;
  try {
    tags = git('tag', '--list', 'v*').split('\n').filter(Boolean);
  } catch {
    console.warn('No git here: the package cannot tell untouched copies of older releases from edited ones.');
    return released;
  }
  for (const tag of tags) {
    for (const source of git('ls-tree', '-r', '--name-only', tag, '--', 'libs/ui/src').split('\n').filter(Boolean)) {
      const key = templateKey(source);
      if (!key) continue;
      const digest = hash(git('show', `${tag}:${source}`));
      released[key] = [...new Set([...(released[key] ?? []), digest])];
    }
  }
  return released;
}

/** The template a source of libs/ui becomes, as sync-cli.mjs maps it; other files are not copied. */
function templateKey(source) {
  const path = source.slice('libs/ui/src/'.length);
  if (path === 'public-api.ts') return 'ui/src/index.ts.template';
  if (path === 'vflow-ui.css') return 'vflow-ui.css';
  if (/^lib\/[^/]+\.ts$/.test(path) && !path.endsWith('.spec.ts')) return `ui/src/${path}.template`;
  return undefined;
}
