import { readJson, type Tree, writeJson } from '@nx/devkit';
import { prompt } from 'enquirer';

export const CONFIG_PATH = 'vflow.json';

/** The `ui` section of vflow.json, the counterpart of spartan's components.json. */
export interface UiConfig {
  componentsPath: string;
  importAlias: string;
  /** Nx only: whether the generated library gets a build target. */
  buildable?: boolean;
}

const DEFAULTS = { componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui', buildable: true };

/**
 * Reads the `ui` section of vflow.json, or asks for it and writes it, as spartan's `ui` does with components.json.
 * Other sections of the file belong to other CLI features and are kept as they are.
 */
export async function loadOrInitUiConfig(
  tree: Tree,
  options: { directory?: string; angularCli: boolean },
): Promise<UiConfig> {
  const file: Record<string, unknown> = tree.exists(CONFIG_PATH) ? readJson(tree, CONFIG_PATH) : {};
  if (file['ui'] !== undefined) return validateUiConfig(file['ui'], options.angularCli);

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
    {
      type: 'input',
      name: 'importAlias',
      message: 'What import alias should be used for the parts?',
      initial: DEFAULTS.importAlias,
    },
    ...(options.angularCli
      ? []
      : [{ type: 'confirm', name: 'buildable', message: 'Should the library be buildable?', initial: true }]),
  ];
  const answers = await prompt<Partial<UiConfig>>(questions);
  const ui = validateUiConfig(
    {
      componentsPath: options.directory ?? answers.componentsPath ?? DEFAULTS.componentsPath,
      importAlias: answers.importAlias ?? DEFAULTS.importAlias,
      ...(options.angularCli ? {} : { buildable: answers.buildable ?? DEFAULTS.buildable }),
    },
    options.angularCli,
  );

  writeJson(tree, CONFIG_PATH, { ...file, ui });
  return ui;
}

/** Checks the section like spartan's zod schema: missing fields take defaults, wrong ones are printed as a table. */
export function validateUiConfig(value: unknown, angularCli: boolean): UiConfig {
  const issues: { path: string; expected: string; message: string }[] = [];
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    issues.push({ path: 'ui', expected: 'object', message: 'The ui section must be an object' });
  }
  const section = (issues.length ? {} : value) as Record<string, unknown>;
  const field = <T>(key: keyof UiConfig, type: 'string' | 'boolean', fallback: T): T => {
    const raw = section[key];
    if (raw === undefined) return fallback;
    if (typeof raw !== type) issues.push({ path: `ui.${key}`, expected: type, message: `Expected ${type}` });
    return raw as T;
  };

  const componentsPath = field('componentsPath', 'string', DEFAULTS.componentsPath);
  const importAlias = field('importAlias', 'string', DEFAULTS.importAlias);
  const buildable = field('buildable', 'boolean', DEFAULTS.buildable);
  if (typeof importAlias === 'string' && importAlias.endsWith('/')) {
    issues.push({ path: 'ui.importAlias', expected: '-', message: 'importAlias should not end with a slash' });
  }

  if (issues.length) {
    console.table(issues, ['path', 'expected', 'message']);
    throw new Error(`${CONFIG_PATH} validation failed. Please fix the issues above.`);
  }
  return angularCli ? { componentsPath, importAlias } : { componentsPath, importAlias, buildable };
}
