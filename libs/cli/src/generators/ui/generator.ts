import {
  type GeneratorCallback,
  joinPathFragments,
  logger,
  readJson,
  readNxJson,
  runTasksInSerial,
  type Tree,
  updateJson,
} from '@nx/devkit';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadOrInitUiConfig, type UiConfig } from '../../utils/config';
import { addNgxVflow } from '../../utils/dependencies';
import type { UiGeneratorSchema } from './schema';

/** Templates of the whole set, copied from libs/ui by `ui:sync-cli`. */
const FILES = join(__dirname, 'files');

/**
 * Copies the vflow UI parts into the workspace, like spartan's `ui` but as one set: the parts are one design system
 * in a handful of small files, so there is nothing to choose. The first run creates the `ui` section of vflow.json,
 * then an Nx library or, in Angular CLI, a tsconfig path. A later run, for example after an update of @vflow/cli,
 * only adds the files that are missing: the copied code belongs to the application.
 */
export async function uiGenerator(tree: Tree, options: UiGeneratorSchema = {}): Promise<GeneratorCallback> {
  const angularCli = options.angularCli ?? false;
  const config = await loadOrInitUiConfig(tree, { directory: options.directory, angularCli });
  const directory = options.directory ?? config.componentsPath;
  const tasks: (GeneratorCallback | undefined)[] = [];

  const installed = config.importAlias in readTsConfigPaths(tree);
  if (!installed) {
    if (angularCli) setupAngularCliProject(tree, config, directory);
    else tasks.push(await createNxLibrary(tree, config, directory));
  }

  const skipped = copyParts(tree, directory, installed);
  if (installed) reportUnexported(tree, directory);
  if (skipped.length) logger.info(`Kept ${skipped.length} existing files of ${config.importAlias}.`);

  tasks.push(addNgxVflow(tree));
  return runTasksInSerial(...tasks.filter((task): task is GeneratorCallback => !!task));
}

export default uiGenerator;

/** The tsconfig whose `paths` the workspace shares: tsconfig.base.json in Nx, tsconfig.json in Angular CLI. */
function rootTsConfig(tree: Tree): string | undefined {
  return ['tsconfig.base.json', 'tsconfig.json'].find((path) => tree.exists(path));
}

function readTsConfigPaths(tree: Tree): Record<string, string[]> {
  const path = rootTsConfig(tree);
  if (!path) return {};
  try {
    return readJson(tree, path).compilerOptions?.paths ?? {};
  } catch {
    return {};
  }
}

/** The parts live outside the app's `src`, so tsconfig.app.json must include them for the editor, as in spartan. */
function setupAngularCliProject(tree: Tree, config: UiConfig, directory: string) {
  const tsconfig = rootTsConfig(tree);
  if (!tsconfig) throw new Error('Could not find tsconfig.json to map the import alias of the parts in.');
  updateJson(tree, tsconfig, (json) => {
    json.compilerOptions ??= {};
    json.compilerOptions.paths = {
      ...json.compilerOptions.paths,
      [config.importAlias]: [`./${joinPathFragments(directory, 'src', 'index.ts')}`],
    };
    return json;
  });

  if (!tree.exists('tsconfig.app.json')) return;
  const glob = `${directory}/src/**/*.ts`;
  updateJson(tree, 'tsconfig.app.json', (json) => {
    // Without `include` TypeScript compiles every file under the config; keep the app's own sources in it.
    json.include = Array.isArray(json.include) ? json.include : ['src/**/*.ts'];
    if (!json.include.includes(glob)) json.include.push(glob);
    return json;
  });
}

/**
 * One Angular library whose import path is the alias; the files the library generator writes are replaced.
 * @nx/angular is an optional peer: every Nx Angular workspace has it, and installing it in Angular CLI is both
 * unneeded and, with npm 10, fails to resolve.
 */
async function createNxLibrary(tree: Tree, config: UiConfig, directory: string): Promise<GeneratorCallback> {
  let angular: typeof import('@nx/angular/generators');
  try {
    angular = await import('@nx/angular/generators');
  } catch {
    throw new Error(
      'The ui generator creates an Nx library with @nx/angular. Install it, or run `ng g @vflow/cli:ui`.',
    );
  }
  const { libraryGenerator, UnitTestRunner } = angular;
  const callback = await libraryGenerator(tree, {
    ...(readNxJson(tree)?.generators?.['@nx/angular:library'] ?? {}),
    directory,
    importPath: config.importAlias,
    buildable: config.buildable ?? true,
    prefix: 'vui',
    skipModule: true,
    skipTests: true,
    skipFormat: true,
    strict: true,
    unitTestRunner: UnitTestRunner.None,
  });

  const lib = joinPathFragments(directory, 'src', 'lib');
  for (const file of filesIn(tree, lib)) tree.delete(file);
  tree.delete(joinPathFragments(directory, 'src', 'index.ts'));
  return callback;
}

/** Writes every template; when the set is already installed only missing files. Returns the kept files. */
function copyParts(tree: Tree, directory: string, installed: boolean): string[] {
  const kept: string[] = [];
  for (const template of templates(FILES)) {
    const target = joinPathFragments(directory, relative(FILES, template).replace(/\.template$/, ''));
    if (installed && tree.exists(target)) {
      kept.push(target);
      continue;
    }
    // index.ts lists the exports of the application: a missing one is written, an existing one is never merged.
    tree.write(target, readFileSync(template, 'utf-8'));
  }
  return kept;
}

/** A new part added by a later run is not exported until the application adds it to its index.ts. */
function reportUnexported(tree: Tree, directory: string) {
  const index = tree.read(joinPathFragments(directory, 'src', 'index.ts'), 'utf-8') ?? '';
  const missing = tree
    .children(joinPathFragments(directory, 'src', 'lib'))
    .map((file) => `./lib/${file.replace(/\.ts$/, '')}`)
    .filter((path) => !index.includes(`'${path}'`));
  if (missing.length) {
    logger.warn(`index.ts of the parts does not export ${missing.join(', ')}; add them if you use them.`);
  }
}

function templates(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? templates(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function filesIn(tree: Tree, dir: string): string[] {
  return tree
    .children(dir)
    .flatMap((name) => (tree.isFile(join(dir, name)) ? [join(dir, name)] : filesIn(tree, join(dir, name))));
}
