import { addDependenciesToPackageJson, type GeneratorCallback, readJson, readJsonFile, type Tree } from '@nx/devkit';
import { join } from 'node:path';

/**
 * Adds ngx-vflow, the behavior the parts build on (spartan's brain), when the workspace does not have it in
 * `dependencies` or `devDependencies`. ngx-vflow and @vflow/cli are released together under one version.
 */
export function addNgxVflow(tree: Tree): GeneratorCallback | undefined {
  const { dependencies = {}, devDependencies = {} } = readJson(tree, 'package.json');
  if (dependencies['ngx-vflow'] || devDependencies['ngx-vflow']) return undefined;

  const { version } = readJsonFile<{ version: string }>(join(__dirname, '../../package.json'));
  return addDependenciesToPackageJson(tree, { 'ngx-vflow': `^${version}` }, {});
}
