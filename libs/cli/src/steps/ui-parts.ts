import { type GeneratorCallback, joinPathFragments, logger, readJson, readNxJson, type Tree } from '@nx/devkit';
import { readdirSync, readFileSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import { loadOrInitUiConfig, type UiConfig } from '../utils/config';
import { setJsoncValue } from '../utils/jsonc';

/** Templates of the whole set, copied from libs/ui by `ui:sync-cli`. */
const FILES = join(__dirname, 'templates', 'ui');

export interface UiPartsOptions {
  /** Directory of the parts; overrides `componentsPath` of vflow.json and skips its question. */
  directory?: string;
  /** Import alias of the parts on the first run; skips its question. */
  importAlias?: string;
  /** Nx only: whether the library gets a build target on the first run; the nx.json default otherwise, then true. */
  buildable?: boolean;
  /** Set by the Angular CLI schematic: paths go to the root tsconfig instead of an Nx library. */
  angularCli?: boolean;
}

/**
 * Step: copies the vflow UI parts into the workspace, like spartan's `ui` but as one set: the parts are one design
 * system in a handful of small files, so there is nothing to choose. The first run creates the `ui` section of
 * vflow.json, then an Nx library or, in Angular CLI, a tsconfig path. A later run, for example after an update of
 * @vflow/cli, only adds the files that are missing: the copied code belongs to the application.
 */
export async function ensureUiParts(tree: Tree, options: UiPartsOptions = {}): Promise<GeneratorCallback | undefined> {
  const angularCli = options.angularCli ?? false;
  const config = await loadOrInitUiConfig(tree, options);
  const directory = options.directory ?? config.componentsPath;
  let task: GeneratorCallback | undefined;

  const installed = config.importAlias in readTsConfigPaths(tree);
  if (installed && normalizePath(directory) !== normalizePath(config.componentsPath)) {
    // A later run adds missing files to the installed set; written elsewhere, nothing would import them.
    throw new Error(
      `${config.importAlias} is already installed in ${config.componentsPath}. ` +
        'Run without --directory to add missing parts, or change componentsPath in vflow.json after moving it.',
    );
  }
  if (!installed) {
    // A first run writes the whole set; a folder of the application must not be overwritten or emptied. A thrown
    // generator writes nothing, vflow.json included.
    if (tree.exists(directory) && tree.children(directory).length) {
      throw new Error(
        `${directory} already has files. Pass --directory with a new or empty folder, or change componentsPath in vflow.json.`,
      );
    }
    if (angularCli) setupAngularCliProject(tree, config, directory);
    else task = await createNxLibrary(tree, config, directory, options.buildable);
  }

  const skipped = copyParts(tree, directory, installed);
  if (installed) reportUnexported(tree, directory);
  if (skipped.length) logger.info(`Kept ${skipped.length} existing files of ${config.importAlias}.`);
  return task;
}

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
  setJsoncValue(tree, tsconfig, ['compilerOptions', 'paths', config.importAlias], () => [
    `./${joinPathFragments(directory, 'src', 'index.ts')}`,
  ]);

  if (!tree.exists('tsconfig.app.json')) return;
  const glob = `${directory}/src/**/*.ts`;
  setJsoncValue(tree, 'tsconfig.app.json', ['include'], (json) => {
    // Without `include` TypeScript compiles every file under the config; keep the app's own sources in it.
    const include: string[] = Array.isArray(json?.include) ? json.include : ['src/**/*.ts'];
    return include.includes(glob) ? include : [...include, glob];
  });
}

/**
 * One Angular library whose import path is the alias; the files the library generator writes are replaced.
 * @nx/angular is an optional peer: every Nx Angular workspace has it, and installing it in Angular CLI is both
 * unneeded and, with npm 10, fails to resolve.
 */
async function createNxLibrary(
  tree: Tree,
  config: UiConfig,
  directory: string,
  buildable: boolean | undefined,
): Promise<GeneratorCallback> {
  let angular: typeof import('@nx/angular/generators');
  try {
    angular = await import('@nx/angular/generators');
  } catch {
    throw new Error(
      'The ui generator creates an Nx library with @nx/angular. Install it, or run `ng g @vflow/cli:ui`.',
    );
  }
  const { libraryGenerator, UnitTestRunner } = angular;
  // Defaults apply when a generator runs from the command line, not when another generator calls it.
  const generators = readNxJson(tree)?.generators ?? {};
  const defaults = { ...generators['@nx/angular']?.['library'], ...generators['@nx/angular:library'] };
  const callback = await libraryGenerator(tree, {
    ...defaults,
    directory,
    importPath: config.importAlias,
    buildable: buildable ?? defaults.buildable ?? true,
    prefix: 'vui',
    skipModule: true,
    skipTests: true,
    skipFormat: true,
    strict: true,
    unitTestRunner: UnitTestRunner.None,
  });

  // The parts replace the sample code of the new library: only what the library generator has just created.
  const src = `${joinPathFragments(directory, 'src')}/`;
  const created = tree.listChanges().filter((change) => change.type === 'CREATE' && change.path.startsWith(src));
  const sample = created.filter(({ path }) => path.startsWith(`${src}lib/`) || path === `${src}index.ts`);
  for (const { path } of sample) tree.delete(path);
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

/**
 * A new part added by a later run is not exported until the application adds it to its index.ts. Only the parts of
 * the set are checked: other files in the folder are the application's own.
 */
function reportUnexported(tree: Tree, directory: string) {
  const index = tree.read(joinPathFragments(directory, 'src', 'index.ts'), 'utf-8') ?? '';
  const lib = join(FILES, 'src', 'lib');
  const missing = templates(lib)
    .map((template) => `./lib/${relative(lib, template).replace(/\.ts\.template$/, '')}`)
    .filter((path) => tree.exists(joinPathFragments(directory, 'src', `${path}.ts`)))
    .filter((path) => !new RegExp(`['"]${escapeRegExp(path)}(\\.js)?['"]`).test(index));
  if (missing.length) {
    logger.warn(`index.ts of the parts does not export ${missing.join(', ')}; add them if you use them.`);
  }
}

function normalizePath(path: string): string {
  return posix.normalize(path).replace(/^\.\//, '').replace(/\/$/, '');
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function templates(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? templates(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}
