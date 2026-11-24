import { logger } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';
import { syncCopiedFile, templateHash } from './updates';

describe('syncCopiedFile', () => {
  const NEW = 'export const part = 2;\n';
  const OLD = 'export const part = 1;\n';
  const released = { 'part.ts.template': [templateHash(OLD)] };
  const sync = (tree: ReturnType<typeof createTree>, options = {}, overwritable = true) =>
    syncCopiedFile(tree, 'part.ts', 'part.ts.template', NEW, options, overwritable, released);

  it('creates a missing file and leaves the current one alone, whatever its line endings', () => {
    const tree = createTree();
    expect(sync(tree)).toBe('created');
    expect(tree.read('part.ts', 'utf-8')).toBe(NEW);

    tree.write('part.ts', NEW.replace(/\n/g, '\r\n') + '\n\n');
    expect(sync(tree)).toBe('current');
  });

  it('replaces an untouched file of an earlier release and keeps an edited one', () => {
    const tree = createTree();
    tree.write('part.ts', OLD);
    expect(sync(tree)).toBe('updated');
    expect(tree.read('part.ts', 'utf-8')).toBe(NEW);

    tree.write('part.ts', 'export const part = 42;\n');
    expect(sync(tree)).toBe('edited');
    expect(tree.read('part.ts', 'utf-8')).toBe('export const part = 42;\n');
  });

  it('replaces an edited file with --overwrite unless it may not be overwritten', () => {
    const tree = createTree();
    tree.write('part.ts', 'mine');
    expect(sync(tree, { overwrite: true }, false)).toBe('edited');
    expect(tree.read('part.ts', 'utf-8')).toBe('mine');
    expect(sync(tree, { overwrite: true })).toBe('overwritten');
    expect(tree.read('part.ts', 'utf-8')).toBe(NEW);
  });

  it('prints the change and writes nothing with --diff', () => {
    const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const tree = createTree();
    tree.write('part.ts', OLD);

    expect(sync(tree, { diff: true })).toBe('updated');
    expect(tree.read('part.ts', 'utf-8')).toBe(OLD);
    expect(info).toHaveBeenCalledWith(expect.stringContaining('-export const part = 1;\n+export const part = 2;'));

    expect(sync(createTree(), { diff: true })).toBe('created');
    expect(info).toHaveBeenCalledWith('Would add part.ts.');
  });
});
