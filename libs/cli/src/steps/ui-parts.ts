import { type GeneratorCallback, joinPathFragments, logger, readNxJson, type Tree } from '@nx/devkit';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  chooseUiInstall,
  findInstalledUi,
  normalizePath,
  readTsConfigPaths,
  rootTsConfig,
  type UiInstall,
} from '../utils/install';
import { setJsoncValue } from '../utils/jsonc';

/** Templates of the whole set, copied from libs/ui by `ui:sync-cli`. */
const FILES = join(__dirname, 'templates', 'ui');
/** File names of the parts, by which a later run recognizes an installed set. */
const PART_FILES = readdirSync(join(FILES, 'src', 'lib')).map((file) => file.replace(/\.template$/, ''));

export interface UiPartsOptions {
  /** Directory of the parts on the first run, or the installed set to update when there are several. */
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
 * system in a handful of small files, so there is nothing to choose. The first run creates an Nx library or, in
 * Angular CLI, a tsconfig path. A later run, for example after an update of @vflow/cli, finds the set through that
 * path and only adds the files that are missing: the copied code belongs to the application. Nothing else is stored.
 */
export async function ensureUiParts(tree: Tree, options: UiPartsOptions = {}): Promise<GeneratorCallback | undefined> {
  const angularCli = options.angularCli ?? false;
  const installs = findInstalledUi(tree, PART_FILES);
  const wanted = options.directory && normalizePath(options.directory);
  let install = wanted ? installs.find(({ componentsPath }) => componentsPath === wanted) : installs[0];
  let task: GeneratorCallback | undefined;

  if (!wanted && installs.length > 1) {
    throw new Error(
      `vflow UI is installed more than once: ${installs.map(({ componentsPath }) => componentsPath).join(', ')}. ` +
        'Pass --directory to choose the set to update.',
    );
  }
  if (!install && installs.length) {
    // A later run adds missing files to the installed set; written elsewhere, nothing would import them.
    const [{ componentsPath, importAlias }] = installs;
    throw new Error(
      `${importAlias} is already installed in ${componentsPath}. Run without --directory to add missing parts.`,
    );
  }

  const installed = !!install;
  if (!install) {
    install = await chooseUiInstall(options);
    const taken = readTsConfigPaths(tree)[install.importAlias];
    if (taken) {
      throw new Error(
        `${install.importAlias} already maps to ${taken.join(', ')}. Pass --importAlias with another alias.`,
      );
    }
    // A first run writes the whole set; a folder of the application must not be overwritten or emptied. A thrown
    // generator writes nothing.
    if (tree.exists(install.componentsPath) && tree.children(install.componentsPath).length) {
      throw new Error(`${install.componentsPath} already has files. Pass --directory with a new or empty folder.`);
    }
    if (angularCli) setupAngularCliProject(tree, install);
    else task = await createNxLibrary(tree, install, options.buildable);
  }

  const directory = install.componentsPath;
  const skipped = copyParts(tree, directory, installed);
  if (installed) reportUnexported(tree, directory);
  if (skipped.length) logger.info(`Kept ${skipped.length} existing files of ${install.importAlias}.`);
  return task;
}

/** The parts live outside the app's `src`, so tsconfig.app.json must include them for the editor, as in spartan. */
function setupAngularCliProject(tree: Tree, { componentsPath: directory, importAlias }: UiInstall) {
  const tsconfig = rootTsConfig(tree);
  if (!tsconfig) throw new Error('Could not find tsconfig.json to map the import alias of the parts in.');
  setJsoncValue(tree, tsconfig, ['compilerOptions', 'paths', importAlias], () => [
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
  { componentsPath: directory, importAlias }: UiInstall,
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
    importPath: importAlias,
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

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function templates(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? templates(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}
