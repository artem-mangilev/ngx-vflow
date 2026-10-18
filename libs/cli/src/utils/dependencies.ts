import { addDependenciesToPackageJson, type GeneratorCallback, readJson, readJsonFile, type Tree } from '@nx/devkit';
import { join } from 'node:path';

/**
 * Adds ngx-vflow, the behavior the parts build on (spartan's brain), when the workspace does not have it in
 * `dependencies` or `devDependencies`. ngx-vflow and @vflow/cli are released together under one version.
 *
 * Its peer @angular/cdk is added in the major of the application's Angular, as spartan does: left to npm, the peer
 * resolves to the newest cdk, which requires a newer Angular than an application on the previous major has.
 */
export function addNgxVflow(tree: Tree): GeneratorCallback | undefined {
  const { dependencies = {}, devDependencies = {} } = readJson(tree, 'package.json');
  const version = (name: string): string | undefined => dependencies[name] ?? devDependencies[name];
  const missing: Record<string, string> = {};

  if (!version('ngx-vflow')) {
    const cli = readJsonFile<{ version: string }>(join(__dirname, '../../package.json'));
    missing['ngx-vflow'] = `^${cli.version}`;
  }
  const angular = /\d+/.exec(version('@angular/core') ?? '')?.[0];
  if (!version('@angular/cdk') && angular) missing['@angular/cdk'] = `^${angular}.0.0`;

  return Object.keys(missing).length ? addDependenciesToPackageJson(tree, missing, {}) : undefined;
}
