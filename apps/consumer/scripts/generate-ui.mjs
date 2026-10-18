// Prepares the `ui` configuration of the consumer the way an application gets vflow UI: the built @vflow/cli runs
// `init` and `ui` in a fresh Angular CLI workspace under tmp/, and the consumer compiles what they wrote, the parts
// through the `@vflow/ui` path and the stylesheet with the preset and the theme values.
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const cli = join(root, 'dist/libs/cli');
const work = join(root, 'tmp/consumer-ui');
const require = createRequire(join(cli, 'package.json'));
const { FsTree, flushChanges } = require('nx/src/generators/tree');

rmSync(work, { recursive: true, force: true });
const write = (path, content) => {
  mkdirSync(dirname(join(work, path)), { recursive: true });
  writeFileSync(join(work, path), typeof content === 'string' ? content : JSON.stringify(content, null, 2));
};
// ngx-vflow is listed, so the generators schedule no install; the consumer maps it to dist itself.
write('package.json', { name: 'consumer-ui', private: true, dependencies: { 'ngx-vflow': '*' } });
write('angular.json', {
  version: 1,
  projects: { app: { root: '', sourceRoot: 'src', projectType: 'application', architect: {} } },
});
write('tsconfig.json', { compilerOptions: {} });
write('tsconfig.app.json', { extends: './tsconfig.json', files: ['src/main.ts'] });
write('vflow.json', { ui: { componentsPath: 'libs/ui', importAlias: '@vflow/ui' } });
// tmp/ is ignored by git, and Tailwind's source detection skips ignored files; an application's parts are not ignored.
write('src/styles.css', "@import 'tailwindcss';\n@source '../libs/ui/src';\n");
// The stylesheet imports `@vflow/cli/ui-preset.css`, which an application resolves from its node_modules.
mkdirSync(join(work, 'node_modules/@vflow'), { recursive: true });
symlinkSync(cli, join(work, 'node_modules/@vflow/cli'), 'dir');

const tree = new FsTree(work, false);
await require('./src/generators/init/generator.js').default(tree, {});
await require('./src/generators/ui/generator.js').default(tree, { angularCli: true });
flushChanges(work, tree.listChanges());
console.log(`Generated vflow UI into ${work}.`);
