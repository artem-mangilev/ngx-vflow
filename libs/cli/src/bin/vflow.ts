#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FsTree, flushChanges, printChanges } from 'nx/src/generators/tree';
import { uiGenerator } from '../generators/ui/generator';
import { parseOptions, USAGE } from './options';

/**
 * `npx @vflow/cli ui`: the `ui` generator without installing @vflow/cli in the workspace. It runs on the files of the
 * current directory as `nx g` does, in Nx mode where `nx.json` exists and in Angular CLI mode otherwise.
 */
async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;
  if (command !== 'ui') {
    console.log(USAGE);
    process.exitCode = command === undefined || command === '--help' || command === '-h' ? 0 : 1;
    return;
  }

  const root = process.cwd();
  const nx = existsSync(join(root, 'nx.json'));
  if (!nx && !existsSync(join(root, 'angular.json'))) {
    throw new Error('No angular.json or nx.json here: run the command in the root of the workspace.');
  }

  const tree = new FsTree(root, false);
  const task = await uiGenerator(tree, { ...parseOptions(rest), angularCli: !nx });
  const changes = tree.listChanges();
  printChanges(changes);
  flushChanges(root, changes);
  await task?.();
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
