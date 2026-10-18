import { type GeneratorCallback, runTasksInSerial, type Tree } from '@nx/devkit';
import { addNgxVflow } from '../../utils/dependencies';
import { addUiTheme } from './theme';
import type { InitGeneratorSchema } from './schema';

/**
 * Sets up vflow UI like spartan's `init`: adds ngx-vflow, the behavior the parts build on (spartan's brain), when the
 * workspace does not have it, then adds the theme to the global stylesheet. The `ui` section of vflow.json is created by `ui`, not here.
 */
export async function initGenerator(tree: Tree, options: InitGeneratorSchema = {}): Promise<GeneratorCallback> {
  const tasks = [addNgxVflow(tree)].filter((task): task is GeneratorCallback => !!task);

  await addUiTheme(tree, options);

  return runTasksInSerial(...tasks);
}

export default initGenerator;
