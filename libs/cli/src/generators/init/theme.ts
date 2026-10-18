import { joinPathFragments, logger, type ProjectConfiguration, type Tree } from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveApplication } from '../../utils/applications';
import type { InitGeneratorSchema } from './schema';

export const PRESET_IMPORT = "@import '@vflow/cli/ui-preset.css';";

/**
 * Adds the vflow UI theme to the global stylesheet of an application, like spartan's `ui-theme`: the preset import
 * right after the leading imports, so `@import 'tailwindcss'` stays first, and the light and dark values at the end,
 * where they become application code. Tailwind itself is a prerequisite and is neither installed nor checked.
 *
 * Not a generator of its own: with one theme there is nothing to choose, and `init` is as idempotent. A generator for
 * another set of parts that needs the tokens calls it the same way.
 */
export async function addUiTheme(tree: Tree, options: InitGeneratorSchema = {}): Promise<void> {
  const project = await resolveApplication(tree, options.project);

  if (options.stylesEntryPoint && !tree.exists(options.stylesEntryPoint)) {
    throw new Error(`The stylesheet "${options.stylesEntryPoint}" does not exist.`);
  }
  const stylesheet = options.stylesEntryPoint ?? findStylesEntryPoint(tree, project);
  if (!stylesheet) {
    throw new Error(
      `Could not find the global stylesheet of "${project.name}". ` +
        'Pass --stylesEntryPoint with its path relative to the workspace root.',
    );
  }

  const css = tree.read(stylesheet, 'utf-8') ?? '';
  const themed = addTheme(css, stylesheet);
  // Angular CLI reports any write as an update, so an unchanged stylesheet is not written.
  if (themed !== css) tree.write(stylesheet, themed);
}

/** Inserts the preset import and appends the theme values; a stylesheet that already has either keeps it. */
export function addTheme(css: string, path = 'the stylesheet'): string {
  let result = css;

  if (result.includes('@vflow/cli/ui-preset.css')) {
    logger.info(`${path} already imports the vflow UI preset.`);
  } else {
    const end = leadingStatementsEnd(result);
    result =
      end === 0 ? `${PRESET_IMPORT}\n${result}` : `${result.slice(0, end)}\n${PRESET_IMPORT}${result.slice(end)}`;
  }

  if (result.includes("[data-vui-theme='dark']")) {
    logger.info(`${path} already has the vflow UI theme values; edit them in place.`);
  } else {
    const values = readFileSync(join(__dirname, 'ui-theme.css'), 'utf-8');
    result = `${result.trimEnd()}\n\n${values}`;
  }

  return result;
}

/**
 * End of the statements that must precede every rule: `@charset`, `@import`, `@layer a, b;` and, in Sass,
 * `@use` / `@forward`. Comments between them are skipped, so a leading comment does not push the preset above
 * `@import 'tailwindcss'`.
 */
function leadingStatementsEnd(css: string): number {
  let index = 0;
  let end = 0;
  while (index < css.length) {
    const rest = css.slice(index);
    const space = /^\s+/.exec(rest);
    if (space) {
      index += space[0].length;
      continue;
    }
    if (rest.startsWith('/*')) {
      const close = css.indexOf('*/', index + 2);
      if (close === -1) break;
      index = close + 2;
      continue;
    }
    if (rest.startsWith('//')) {
      const newline = css.indexOf('\n', index);
      index = newline === -1 ? css.length : newline;
      continue;
    }
    const statement = /^@(charset|import|layer|use|forward)\b[^;{]*;/.exec(rest);
    if (!statement) break;
    index += statement[0].length;
    end = index;
  }
  return end;
}

/**
 * The global stylesheet of a project, found like spartan does: `styles.{css,scss,sass,less}` in its source root,
 * then the first stylesheet of the project in the build options.
 */
export function findStylesEntryPoint(tree: Tree, project: ProjectConfiguration): string | undefined {
  const sourceRoot = project.sourceRoot ?? project.root;
  const conventional = ['css', 'scss', 'sass', 'less']
    .map((extension) => joinPathFragments(sourceRoot, `styles.${extension}`))
    .find((path) => tree.exists(path));
  if (conventional) return conventional;

  const styles: Array<string | { input: string; inject?: boolean }> = project.targets?.['build']?.options?.styles ?? [];
  for (const style of styles) {
    const path = typeof style === 'string' ? style : style.inject === false ? undefined : style.input;
    if (path && path.startsWith(project.root) && tree.exists(path)) return path;
  }
  return undefined;
}
