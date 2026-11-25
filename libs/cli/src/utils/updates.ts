import { logger, type Tree } from '@nx/devkit';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createTwoFilesPatch } from 'diff';

/** How a later run treats the copied files the workspace already has. */
export interface UpdateOptions {
  /** Prints what an update would change in each copied file, and writes nothing. */
  diff?: boolean;
  /** Replaces copied files that have changes of the application too. */
  overwrite?: boolean;
}

/**
 * Hashes of every copied file as each released version of @vflow/cli wrote it, keyed by its path under
 * `src/steps/templates`. The build computes it from the git tags (scripts/copy-assets.mjs); without the file every
 * changed copy counts as edited by the application, so nothing is replaced unasked.
 */
function readReleased(): Record<string, string[]> {
  const file = join(__dirname, '..', '..', 'released-templates.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : {};
}

/** The hash a copy is recognized by: line endings and trailing blank lines do not count as changes. */
export function templateHash(text: string): string {
  return createHash('sha256').update(text.replace(/\r\n/g, '\n').trimEnd()).digest('hex');
}

/**
 * A copied file and what a run does with it:
 * - `created`: the workspace did not have it;
 * - `current`: it is the file of this version;
 * - `updated`: it was the file of an earlier release, untouched, and is replaced;
 * - `edited`: it has changes of the application and is kept, unless `--overwrite` replaced it (`overwritten`).
 */
export type CopyResult = 'created' | 'current' | 'updated' | 'edited' | 'overwritten';

/**
 * Writes one copied file. `key` is its path under `src/steps/templates`; `overwritable` false keeps an edited file even
 * with `--overwrite`, for files the application extends, such as the index of the parts. In `--diff` mode nothing is
 * written and the change is printed.
 */
export function syncCopiedFile(
  tree: Tree,
  path: string,
  key: string,
  template: string,
  options: UpdateOptions,
  overwritable = true,
  released: Record<string, string[]> = readReleased(),
): CopyResult {
  const existing = tree.read(path, 'utf-8');
  if (existing === null) {
    if (options.diff) logger.info(`Would add ${path}.`);
    else tree.write(path, template);
    return 'created';
  }
  if (templateHash(existing) === templateHash(template)) return 'current';

  const result = (released[key] ?? []).includes(templateHash(existing)) ? 'updated' : 'edited';
  if (options.diff) {
    logger.info(createTwoFilesPatch(path, path, existing, template, 'yours', 'this version of @vflow/cli'));
    return result;
  }
  if (result === 'updated' || (options.overwrite && overwritable)) {
    tree.write(path, template);
    return result === 'updated' ? 'updated' : 'overwritten';
  }
  return 'edited';
}

/** One line about the copied files a run updated, and which edited ones it kept. */
export function reportCopies(results: Map<string, CopyResult>, options: UpdateOptions): void {
  const of = (result: CopyResult) => [...results].filter(([, value]) => value === result).map(([path]) => path);
  const updated = of('updated');
  const overwritten = of('overwritten');
  const edited = of('edited');

  if (options.diff) {
    if (!updated.length && !edited.length) logger.info('The copied files are up to date.');
    return;
  }
  if (updated.length) logger.info(`Updated ${files(updated)} you had not changed: ${updated.join(', ')}.`);
  if (overwritten.length) logger.warn(`Replaced ${files(overwritten)} with your changes: ${overwritten.join(', ')}.`);
  if (edited.length) {
    logger.warn(
      `${files(edited)} with your changes ${edited.length === 1 ? 'has' : 'have'} a newer version: ${edited.join(', ')}. ` +
        'See the changes with --diff; replace the files with --overwrite.',
    );
  }
}

function files(paths: string[]): string {
  return `${paths.length} file${paths.length === 1 ? '' : 's'}`;
}
