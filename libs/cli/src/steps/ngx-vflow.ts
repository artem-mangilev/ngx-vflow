import { addDependenciesToPackageJson, type GeneratorCallback, readJson, readJsonFile, type Tree } from '@nx/devkit';
import { join } from 'node:path';

/**
 * Step: adds ngx-vflow, the behavior the parts build on (spartan's brain), when the workspace does not have it in
 * `dependencies` or `devDependencies`. ngx-vflow and @vflow/cli are released together under one version, so an
 * ngx-vflow of an older major is refused: the parts are written against the API of the CLI's major, and the
 * application has to migrate before it gets them.
 */
export function ensureNgxVflow(tree: Tree): GeneratorCallback | undefined {
  const { dependencies = {}, devDependencies = {} } = readJson(tree, 'package.json');
  const cli = readJsonFile<{ version: string }>(join(__dirname, '../../package.json')).version;

  const existing: string | undefined = dependencies['ngx-vflow'] ?? devDependencies['ngx-vflow'];
  if (!existing) return addDependenciesToPackageJson(tree, { 'ngx-vflow': `^${cli}` }, {});
  if (Number(majorOf(existing) ?? Infinity) < Number(majorOf(cli))) {
    throw new Error(
      `The vflow UI parts need ngx-vflow ${majorOf(cli)}, and this workspace has ngx-vflow ${existing}. ` +
        'Update ngx-vflow first; see the migration guide at https://www.ngx-vflow.org.',
    );
  }
  return undefined;
}

/** The first number of a version or range; a range without one, such as `latest` or a file path, has none. */
function majorOf(range: string): string | undefined {
  return /\d+/.exec(range)?.[0];
}
