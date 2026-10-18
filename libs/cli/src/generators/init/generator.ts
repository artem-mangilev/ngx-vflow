import { type GeneratorCallback, runTasksInSerial, type Tree } from '@nx/devkit';
import { addNgxVflow } from '../../utils/dependencies';
import { uiThemeGenerator } from '../ui-theme/generator';
import type { InitGeneratorSchema } from './schema';

/**
 * Sets up vflow UI like spartan's `init`: adds ngx-vflow, the behavior the parts build on (spartan's brain), when the
 * workspace does not have it, then runs `ui-theme`. The `ui` section of vflow.json is created by `ui`, not here.
 */
export async function initGenerator(tree: Tree, options: InitGeneratorSchema = {}): Promise<GeneratorCallback> {
  const tasks = [addNgxVflow(tree)].filter((task): task is GeneratorCallback => !!task);

  await uiThemeGenerator(tree, options);

  return runTasksInSerial(...tasks);
}

export default initGenerator;
