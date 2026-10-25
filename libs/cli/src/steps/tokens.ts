import { joinPathFragments, logger, type ProjectConfiguration, readJson, type Tree } from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getApplications, resolveApplication } from '../utils/applications';

/** The tokens file copied next to the global stylesheet; see libs/ui/src/vflow-ui.css. */
export const THEME_FILE = 'vflow-ui.css';
export const THEME_IMPORT = `@import './${THEME_FILE}';`;

export interface TokensOptions {
  /** The application whose global stylesheet gets the tokens. Asked for when the workspace has several. */
  project?: string;
  /** Path of the global stylesheet relative to the workspace root. Found in the application when omitted. */
  stylesEntryPoint?: string;
}

/**
 * Step: adds the vflow UI tokens to an application, like spartan's `ui-theme` but copied the way shadcn copies its
 * theme: `vflow-ui.css` (values, Tailwind keys, the mapping onto core tokens) next to the global stylesheet, and its
 * import right after the leading imports, so `@import 'tailwindcss'` stays first. Nothing is imported from @vflow/cli,
 * so the application does not need the package after the generators ran. Tailwind CSS 4 is a prerequisite: checked,
 * not installed.
 *
 * Idempotent, so every generator whose parts need the tokens runs it; with one theme there is nothing to choose. A
 * workspace without applications, such as one that only publishes libraries, is skipped with a hint.
 */
export async function ensureUiTokens(tree: Tree, options: TokensOptions = {}): Promise<void> {
  if (!options.project && getApplications(tree).size === 0) {
    logger.warn(`This workspace has no application: add ${THEME_FILE} by running the generator again with --project.`);
    return;
  }
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
  else tree.write(tokens, readFileSync(join(__dirname, 'templates', THEME_FILE), 'utf-8'));

  const css = tree.read(stylesheet, 'utf-8') ?? '';
  const imported = importTheme(css, stylesheet);
  // Angular CLI reports any write as an update, so an unchanged stylesheet is not written.
  if (imported !== css) tree.write(stylesheet, imported);
}

/**
 * The tokens use `@theme`, `@utility` and `--theme()`: Tailwind 3 fails on them and without Tailwind the parts lose
 * their styles silently. The installed version decides; without node_modules the range does, and a range that
 * allows 4 (`>=3.4`, `^3 || ^4`) or has no version number (`latest`) is trusted.
 */
function requireTailwind4(tree: Tree): void {
  const { dependencies = {}, devDependencies = {} } = readJson(tree, 'package.json');
  const range: string | undefined = dependencies['tailwindcss'] ?? devDependencies['tailwindcss'];
  const guide = 'https://tailwindcss.com/docs/installation/framework-guides/angular';
  if (!range) throw new Error(`vflow UI needs Tailwind CSS 4. Set it up first: ${guide}`);
  const manifest = 'node_modules/tailwindcss/package.json';
  const installed: string | undefined = tree.exists(manifest) ? readJson(tree, manifest).version : undefined;
  if (installed ? Number(/\d+/.exec(installed)?.[0]) < 4 : !allowsTailwind4(range)) {
    throw new Error(
      `vflow UI needs Tailwind CSS 4, and this workspace has tailwindcss ${installed ?? range}. See ${guide}`,
    );
  }
}

/** Whether one of the alternatives of a range has a major of at least 4 or is open up to at least 4. */
export function allowsTailwind4(range: string): boolean {
  return range.split('||').some((alternative) => {
    const comparator = alternative.trim();
    const major = /\d+/.exec(comparator)?.[0];
    if (!major || Number(major) >= 4) return true;
    if (!comparator.startsWith('>')) return false;
    const upper = /<(=?)\s*v?(\d+)((?:\.\d+)*)/.exec(comparator);
    if (!upper) return true;
    const [, inclusive, upperMajor, rest] = upper;
    return Number(upperMajor) > 4 || (Number(upperMajor) === 4 && (!!inclusive || /[1-9]/.test(rest)));
  });
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
 * then the stylesheets of the project in the build options. A CSS file wins over an earlier Sass or Less one, since
 * Tailwind 4 compiles CSS only; without one the first stylesheet is returned, and the caller explains the problem.
 */
export function findStylesEntryPoint(tree: Tree, project: ProjectConfiguration): string | undefined {
  const sourceRoot = project.sourceRoot ?? project.root;
  const conventional = ['css', 'scss', 'sass', 'less'].map((extension) =>
    joinPathFragments(sourceRoot, `styles.${extension}`),
  );
  const styles: Array<string | { input: string; inject?: boolean }> = project.targets?.['build']?.options?.styles ?? [];
  const built = styles
    .map((style) => (typeof style === 'string' ? style : style.inject === false ? undefined : style.input))
    .filter((path): path is string => !!path && isInProject(path, project.root));

  const candidates = [...conventional, ...built].filter((path) => tree.exists(path));
  return candidates.find((path) => path.endsWith('.css')) ?? candidates[0];
}

/** `apps/shop-admin/x.css` is not in `apps/shop`; an empty root is the Angular CLI workspace root. */
function isInProject(path: string, root: string): boolean {
  return !root || root === '.' || path.startsWith(`${root.replace(/\/$/, '')}/`);
}
