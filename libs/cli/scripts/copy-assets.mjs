// Completes libs/cli/dist after tsc: the manifests and every non-TypeScript file under src (schemas, the part
// templates and the tokens file), so the package has the layout generators.json points at.
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
