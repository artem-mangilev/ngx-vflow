import { type GeneratorCallback, runTasksInSerial, type Tree } from '@nx/devkit';
import { ensureNgxVflow } from '../../steps/ngx-vflow';
import { ensureUiTokens } from '../../steps/tokens';
import { ensureUiParts } from '../../steps/ui-parts';
import { type CopyResult, reportCopies } from '../../utils/updates';
import type { UiGeneratorSchema } from './schema';

/**
 * Sets up vflow UI: ngx-vflow, the tokens in an application and the parts in the workspace. Every step adds only what
 * is missing, so the same command sets up the workspace, adds the tokens to another application (`--project`) and,
 * after an update of @vflow/cli, adds new parts and updates the copied files the application has not changed.
 * `--diff` prints what an update would change and writes nothing. Steps throw before anything is written, and a
 * thrown generator writes nothing.
 */
export async function uiGenerator(tree: Tree, options: UiGeneratorSchema = {}): Promise<GeneratorCallback> {
  const results = new Map<string, CopyResult>();
  const tasks = options.diff ? [] : [ensureNgxVflow(tree)];
  await ensureUiTokens(tree, options, results);
  tasks.push(await ensureUiParts(tree, options, results));
  reportCopies(results, options);
  return runTasksInSerial(...tasks.filter((task): task is GeneratorCallback => !!task));
}

export default uiGenerator;
