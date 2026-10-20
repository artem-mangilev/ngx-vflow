// Completes dist/libs/cli after tsc: the manifests and every non-TypeScript file under src (schemas, the part
// templates and the tokens file), so the package has the layout generators.json points at.
import { cpSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, '../../dist/libs/cli');

for (const file of ['package.json', 'generators.json', 'README.md', 'LICENSE']) {
  cpSync(join(root, file), join(dist, file));
}

function copyAssets(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) copyAssets(path);
    else if (!entry.name.endsWith('.ts')) cpSync(path, join(dist, relative(root, path)));
  }
}
copyAssets(join(root, 'src'));
