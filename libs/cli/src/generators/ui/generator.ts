import { type GeneratorCallback, runTasksInSerial, type Tree } from '@nx/devkit';
import { ensureNgxVflow } from '../../steps/ngx-vflow';
import { ensureUiTokens } from '../../steps/tokens';
import { ensureUiParts } from '../../steps/ui-parts';
import type { UiGeneratorSchema } from './schema';

/**
 * Sets up vflow UI: ngx-vflow, the tokens in an application and the parts in the workspace. Every step adds only what
 * is missing, so the same command sets up the workspace, adds the tokens to another application (`--project`) and,
 * after an update of @vflow/cli, adds new parts. Steps throw before anything is written, and a thrown generator
 * writes nothing.
 */
export async function uiGenerator(tree: Tree, options: UiGeneratorSchema = {}): Promise<GeneratorCallback> {
  const tasks = [ensureNgxVflow(tree)];
  await ensureUiTokens(tree, options);
  tasks.push(await ensureUiParts(tree, options));
  return runTasksInSerial(...tasks.filter((task): task is GeneratorCallback => !!task));
}

export default uiGenerator;
