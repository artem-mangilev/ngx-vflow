import type { Tree } from '@nx/devkit';
import { applyEdits, type JSONPath, modify, parse } from 'jsonc-parser';

/**
 * Sets values in a JSON file with comments, such as the tsconfig files of Angular CLI, and keeps its comments and
 * formatting; Nx's `updateJson` would rewrite the whole file. `value` receives the current content.
 */
export function setJsoncValue(tree: Tree, path: string, at: JSONPath, value: (current: any) => unknown): void {
  const text = tree.read(path, 'utf-8') ?? '{}';
  const edits = modify(text, at, value(parse(text)), { formattingOptions: { insertSpaces: true, tabSize: 2 } });
  tree.write(path, applyEdits(text, edits));
}
