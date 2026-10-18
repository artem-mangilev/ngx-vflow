import {
  addDependenciesToPackageJson,
  type GeneratorCallback,
  readJson,
  readJsonFile,
  runTasksInSerial,
  type Tree,
} from '@nx/devkit';
import { join } from 'node:path';
import { uiThemeGenerator } from '../ui-theme/generator';
import type { InitGeneratorSchema } from './schema';

/**
 * Sets up vflow UI like spartan's `init`: adds ngx-vflow, the behavior the parts build on (spartan's brain), when the
 * workspace does not have it, then runs `ui-theme`. The `ui` section of vflow.json is created by `ui`, not here.
 */
export async function initGenerator(tree: Tree, options: InitGeneratorSchema = {}): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];
  const { dependencies = {}, devDependencies = {} } = readJson(tree, 'package.json');

  if (!dependencies['ngx-vflow'] && !devDependencies['ngx-vflow']) {
    // ngx-vflow and @vflow/cli are released together under one version.
    const { version } = readJsonFile<{ version: string }>(join(__dirname, '../../../package.json'));
    tasks.push(addDependenciesToPackageJson(tree, { 'ngx-vflow': `^${version}` }, {}));
  }

  await uiThemeGenerator(tree, options);

  return runTasksInSerial(...tasks);
}

export default initGenerator;
