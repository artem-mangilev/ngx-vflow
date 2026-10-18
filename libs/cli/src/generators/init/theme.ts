import { joinPathFragments, logger, type ProjectConfiguration, readJson, type Tree } from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { resolveApplication } from '../../utils/applications';
import type { InitGeneratorSchema } from './schema';

/** The tokens file `init` copies next to the global stylesheet; see libs/ui/src/vflow-ui.css. */
export const THEME_FILE = 'vflow-ui.css';
export const THEME_IMPORT = `@import './${THEME_FILE}';`;

/**
 * Adds the vflow UI tokens to an application, like spartan's `ui-theme` but copied the way shadcn copies its theme:
 * `vflow-ui.css` (values, Tailwind keys, the mapping onto core tokens) next to the global stylesheet, and its import
 * right after the leading imports, so `@import 'tailwindcss'` stays first. Nothing is imported from @vflow/cli, so the
 * application does not need the package after the generators ran. Tailwind CSS 4 is a prerequisite: checked, not
 * installed.
 *
 * Not a generator of its own: with one theme there is nothing to choose, and `init` is as idempotent. A generator for
 * another set of parts that needs the tokens calls it the same way.
 */
export async function addUiTheme(tree: Tree, options: InitGeneratorSchema = {}): Promise<void> {
  requireTailwind4(tree);
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

  // Tailwind 4 compiles plain CSS only; the import would also break the indented Sass syntax.
  if (!stylesheet.endsWith('.css')) {
    throw new Error(
      `${stylesheet} is not a CSS file, and Tailwind CSS 4 compiles CSS only. ` +
        "Add a .css stylesheet with @import 'tailwindcss' and pass it as --stylesEntryPoint.",
    );
  }

  // An existing tokens file is the application's code by now and is kept.
  const tokens = joinPathFragments(dirname(stylesheet), THEME_FILE);
  if (tree.exists(tokens)) logger.info(`${tokens} already exists and is kept.`);
  else tree.write(tokens, readFileSync(join(__dirname, THEME_FILE), 'utf-8'));

  const css = tree.read(stylesheet, 'utf-8') ?? '';
  const imported = importTheme(css, stylesheet);
  // Angular CLI reports any write as an update, so an unchanged stylesheet is not written.
  if (imported !== css) tree.write(stylesheet, imported);
}

/**
 * The tokens use `@theme`, `@utility` and `--theme()`: Tailwind 3 fails on them and without Tailwind the parts lose
 * their styles silently. A range without a version number, such as `latest`, is trusted.
 */
function requireTailwind4(tree: Tree): void {
  const { dependencies = {}, devDependencies = {} } = readJson(tree, 'package.json');
  const range: string | undefined = dependencies['tailwindcss'] ?? devDependencies['tailwindcss'];
  const guide = 'https://tailwindcss.com/docs/installation/framework-guides/angular';
  if (!range) throw new Error(`vflow UI needs Tailwind CSS 4. Set it up first: ${guide}`);
  const major = /\d+/.exec(range)?.[0];
  if (major && Number(major) < 4) {
    throw new Error(`vflow UI needs Tailwind CSS 4, and this workspace has tailwindcss ${range}. See ${guide}`);
  }
}

/** Inserts the import of the tokens file after the leading statements, unless the stylesheet already has it. */
export function importTheme(css: string, path = 'the stylesheet'): string {
  if (css.includes(THEME_FILE)) {
    logger.info(`${path} already imports ${THEME_FILE}.`);
    return css;
  }
  const end = leadingStatementsEnd(css);
  return end === 0 ? `${THEME_IMPORT}\n${css}` : `${css.slice(0, end)}\n${THEME_IMPORT}${css.slice(end)}`;
}

/**
 * End of the statements that must precede every rule: `@charset`, `@import` and `@layer a, b;`. Comments between them
 * are skipped, so a leading comment does not push the import above `@import 'tailwindcss'`.
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
    const statement = /^@(charset|import|layer)\b[^;{]*;/.exec(rest);
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
