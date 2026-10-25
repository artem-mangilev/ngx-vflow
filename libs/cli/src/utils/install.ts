import { type Tree, readJson } from '@nx/devkit';
import { prompt } from 'enquirer';
import { posix } from 'node:path';

/** Where the parts live and how the application imports them. */
export interface UiInstall {
  componentsPath: string;
  importAlias: string;
}

const DEFAULTS: UiInstall = { componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' };

/** The tsconfig whose `paths` the workspace shares: tsconfig.base.json in Nx, tsconfig.json in Angular CLI. */
export function rootTsConfig(tree: Tree): string | undefined {
  return ['tsconfig.base.json', 'tsconfig.json'].find((path) => tree.exists(path));
}

export function readTsConfigPaths(tree: Tree): Record<string, string[]> {
  const path = rootTsConfig(tree);
  if (!path) return {};
  try {
    return readJson(tree, path).compilerOptions?.paths ?? {};
  } catch {
    return {};
  }
}

/**
 * The sets installed by earlier runs, found in the workspace instead of a config file of ours: an alias in the root
 * tsconfig whose `<dir>/src/index.ts` has at least two files of the set beside it in `<dir>/src/lib`. A moved or
 * renamed set is found as long as the application keeps importing it through `paths`.
 */
export function findInstalledUi(tree: Tree, partFiles: string[]): UiInstall[] {
  return Object.entries(readTsConfigPaths(tree)).flatMap(([importAlias, [target = '']]) => {
    const index = normalizePath(target);
    if (!index.endsWith('/src/index.ts')) return [];
    const componentsPath = index.slice(0, -'/src/index.ts'.length);
    const found = partFiles.filter((file) => tree.exists(posix.join(componentsPath, 'src', 'lib', file)));
    return found.length >= 2 ? [{ componentsPath, importAlias }] : [];
  });
}

/**
 * Where a first run puts the set: the options, the answers to what they leave open, or the defaults. Without an
 * interactive terminal (`--no-interactive`, CI) nothing is asked. Nothing is written for later runs.
 */
export async function chooseUiInstall(options: { directory?: string; importAlias?: string }): Promise<UiInstall> {
  const questions = [
    ...(options.directory
      ? []
      : [
          {
            type: 'input',
            name: 'componentsPath',
            message: 'Choose a directory for the vflow UI parts, e.g. libs/vflow-ui',
            initial: DEFAULTS.componentsPath,
          },
        ]),
    ...(options.importAlias
      ? []
      : [
          {
            type: 'input',
            name: 'importAlias',
            message: 'What import alias should be used for the parts?',
            initial: DEFAULTS.importAlias,
          },
        ]),
  ];
  const answers = questions.length && isInteractive() ? await prompt<Partial<UiInstall>>(questions) : {};
  const install = {
    componentsPath: normalizePath(options.directory ?? answers.componentsPath ?? DEFAULTS.componentsPath),
    importAlias: options.importAlias ?? answers.importAlias ?? DEFAULTS.importAlias,
  };
  if (install.importAlias.endsWith('/')) throw new Error('The import alias of the parts should not end with a slash.');
  return install;
}

/** `nx g` sets NX_INTERACTIVE from `--interactive`; Angular CLI does not, so a terminal decides there. */
export function isInteractive(): boolean {
  const nx = process.env['NX_INTERACTIVE'];
  return nx === undefined ? !!process.stdin.isTTY : nx === 'true';
}

export function normalizePath(path: string): string {
  return posix.normalize(path).replace(/^\.\//, '').replace(/\/$/, '');
}
