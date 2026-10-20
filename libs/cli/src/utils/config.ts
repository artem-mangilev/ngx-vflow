import { readJson, type Tree, writeJson } from '@nx/devkit';
import { prompt } from 'enquirer';

export const CONFIG_PATH = 'vflow.json';

/** The `ui` section of vflow.json, the counterpart of spartan's components.json. */
export interface UiConfig {
  componentsPath: string;
  importAlias: string;
}

const DEFAULTS = { componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' };

/**
 * Reads the `ui` section of vflow.json, or asks for it and writes it, as spartan's `ui` does with components.json.
 * Supplied options are not asked for; without an interactive terminal (`--no-interactive`, CI) nothing is asked and
 * the defaults fill the rest. Other sections of the file belong to other CLI features and are kept as they are.
 */
export async function loadOrInitUiConfig(
  tree: Tree,
  options: { directory?: string; importAlias?: string },
): Promise<UiConfig> {
  const file: Record<string, unknown> = tree.exists(CONFIG_PATH) ? readJson(tree, CONFIG_PATH) : {};
  if (file['ui'] !== undefined) return validateUiConfig(file['ui']);

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
  const answers = questions.length && isInteractive() ? await prompt<Partial<UiConfig>>(questions) : {};
  const ui = validateUiConfig({
    componentsPath: options.directory ?? answers.componentsPath ?? DEFAULTS.componentsPath,
    importAlias: options.importAlias ?? answers.importAlias ?? DEFAULTS.importAlias,
  });

  writeJson(tree, CONFIG_PATH, { ...file, ui });
  return ui;
}

/** `nx g` sets NX_INTERACTIVE from `--interactive`; Angular CLI does not, so a terminal decides there. */
export function isInteractive(): boolean {
  const nx = process.env['NX_INTERACTIVE'];
  return nx === undefined ? !!process.stdin.isTTY : nx === 'true';
}

/** Checks the section like spartan's zod schema: missing fields take defaults, wrong ones are printed as a table. */
export function validateUiConfig(value: unknown): UiConfig {
  const issues: { path: string; expected: string; message: string }[] = [];
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    issues.push({ path: 'ui', expected: 'object', message: 'The ui section must be an object' });
  }
  const section = (issues.length ? {} : value) as Record<string, unknown>;
  const field = <T>(key: keyof UiConfig, type: 'string', fallback: T): T => {
    const raw = section[key];
    if (raw === undefined) return fallback;
    if (typeof raw !== type) issues.push({ path: `ui.${key}`, expected: type, message: `Expected ${type}` });
    return raw as T;
  };

  const componentsPath = field('componentsPath', 'string', DEFAULTS.componentsPath);
  const importAlias = field('importAlias', 'string', DEFAULTS.importAlias);
  if (typeof importAlias === 'string' && importAlias.endsWith('/')) {
    issues.push({ path: 'ui.importAlias', expected: '-', message: 'importAlias should not end with a slash' });
  }

  if (issues.length) {
    console.table(issues, ['path', 'expected', 'message']);
    throw new Error(`${CONFIG_PATH} validation failed. Please fix the issues above.`);
  }
  return { componentsPath, importAlias };
}
