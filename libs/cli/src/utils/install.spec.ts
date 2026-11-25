import { type Tree, writeJson } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';
import { prompt } from 'enquirer';
import {
  chooseUiInstall,
  findInstalledUi,
  isInteractive,
  normalizePath,
  readTsConfigPaths,
  rootTsConfig,
  workspaceDirectory,
} from './install';

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

const FILES = ['a.ts', 'b.ts', 'c.ts'];

function addSet(tree: Tree, directory: string, files: string[]) {
  for (const file of files) tree.write(`${directory}/src/lib/${file}`, '');
}

describe('install', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
  });

  describe('rootTsConfig', () => {
    it('prefers tsconfig.base.json over tsconfig.json', () => {
      tree.write('tsconfig.json', '{}');
      tree.write('tsconfig.base.json', '{}');

      expect(rootTsConfig(tree)).toBe('tsconfig.base.json');
    });

    it('falls back to tsconfig.json', () => {
      tree.write('tsconfig.json', '{}');

      expect(rootTsConfig(tree)).toBe('tsconfig.json');
    });

    it('is undefined without a root tsconfig', () => {
      expect(rootTsConfig(tree)).toBeUndefined();
    });
  });

  describe('readTsConfigPaths', () => {
    it('reads the paths of the root tsconfig', () => {
      writeJson(tree, 'tsconfig.base.json', { compilerOptions: { paths: { '@a': ['a.ts'] } } });

      expect(readTsConfigPaths(tree)).toEqual({ '@a': ['a.ts'] });
    });

    it.each([
      ['no tsconfig', undefined],
      ['no compilerOptions', '{}'],
      ['invalid JSON', '{ not json'],
    ])('is empty with %s', (_, content) => {
      if (content !== undefined) tree.write('tsconfig.json', content);

      expect(readTsConfigPaths(tree)).toEqual({});
    });
  });

  describe('findInstalledUi', () => {
    it('finds a set by its alias and the files beside the index', () => {
      writeJson(tree, 'tsconfig.json', { compilerOptions: { paths: { '@acme/ui': ['./libs/flow/src/index.ts'] } } });
      addSet(tree, 'libs/flow', FILES);

      expect(findInstalledUi(tree, FILES)).toEqual([{ componentsPath: 'libs/flow', importAlias: '@acme/ui' }]);
    });

    it('finds a path written with backslashes', () => {
      writeJson(tree, 'tsconfig.json', {
        compilerOptions: { paths: { '@acme/ui': ['.\\libs\\flow\\src\\index.ts'] } },
      });
      addSet(tree, 'libs/flow', FILES);

      expect(findInstalledUi(tree, FILES)).toHaveLength(1);
    });

    it('needs at least two files of the set', () => {
      writeJson(tree, 'tsconfig.json', { compilerOptions: { paths: { '@acme/ui': ['libs/flow/src/index.ts'] } } });
      addSet(tree, 'libs/flow', ['a.ts']);

      expect(findInstalledUi(tree, FILES)).toEqual([]);
    });

    it('ignores an alias that does not point at src/index.ts', () => {
      writeJson(tree, 'tsconfig.json', { compilerOptions: { paths: { '@acme/ui': ['libs/flow/main.ts'] } } });
      addSet(tree, 'libs/flow', FILES);

      expect(findInstalledUi(tree, FILES)).toEqual([]);
    });

    it('finds every set when there are several', () => {
      writeJson(tree, 'tsconfig.json', {
        compilerOptions: { paths: { '@a': ['libs/a/src/index.ts'], '@b': ['libs/b/src/index.ts'] } },
      });
      addSet(tree, 'libs/a', FILES);
      addSet(tree, 'libs/b', FILES);

      expect(findInstalledUi(tree, FILES).map((install) => install.componentsPath)).toEqual(['libs/a', 'libs/b']);
    });
  });

  describe('normalizePath', () => {
    it.each([
      ['./libs/ui/', 'libs/ui'],
      ['libs\\ui', 'libs/ui'],
      ['libs/a/../ui', 'libs/ui'],
      ['libs/ui', 'libs/ui'],
    ])('turns %s into %s', (path, expected) => {
      expect(normalizePath(path)).toBe(expected);
    });
  });

  describe('workspaceDirectory', () => {
    it.each([
      ['libs/ui', 'libs/ui'],
      ['./libs\\ui/', 'libs/ui'],
    ])('accepts %s as %s', (path, expected) => {
      expect(workspaceDirectory(path)).toBe(expected);
    });

    it.each(['../outside', '..', '/abs/ui', 'C:\\ui', 'libs/../../ui'])('refuses %s', (path) => {
      expect(() => workspaceDirectory(path)).toThrow('inside the workspace');
    });
  });

  describe('isInteractive', () => {
    it.each([
      ['true', true],
      ['false', false],
    ])('follows NX_INTERACTIVE=%s', (value, expected) => {
      vi.stubEnv('NX_INTERACTIVE', value);

      expect(isInteractive()).toBe(expected);
    });

    describe('without NX_INTERACTIVE', () => {
      const original = process.stdin.isTTY;
      afterEach(() => Object.defineProperty(process.stdin, 'isTTY', { value: original, configurable: true }));

      it.each([true, false])('follows a terminal on stdin (%s)', (isTTY) => {
        vi.stubEnv('NX_INTERACTIVE', undefined);
        Object.defineProperty(process.stdin, 'isTTY', { value: isTTY, configurable: true });

        expect(isInteractive()).toBe(isTTY);
      });
    });
  });

  describe('chooseUiInstall', () => {
    it('takes both options without asking', async () => {
      vi.stubEnv('NX_INTERACTIVE', 'true');

      await expect(chooseUiInstall({ directory: 'libs/x', importAlias: '@x/ui' })).resolves.toEqual({
        componentsPath: 'libs/x',
        importAlias: '@x/ui',
      });
      expect(prompt).not.toHaveBeenCalled();
    });

    it('asks only for what the options leave open', async () => {
      vi.stubEnv('NX_INTERACTIVE', 'true');
      vi.mocked(prompt).mockResolvedValue({ importAlias: '@asked/ui' });

      const install = await chooseUiInstall({ directory: 'libs/x' });

      expect(install).toEqual({ componentsPath: 'libs/x', importAlias: '@asked/ui' });
      expect(prompt).toHaveBeenCalledWith([expect.objectContaining({ name: 'importAlias', initial: '@vflow/ui' })]);
    });

    it('takes the defaults without a terminal', async () => {
      vi.stubEnv('NX_INTERACTIVE', 'false');

      await expect(chooseUiInstall({})).resolves.toEqual({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
      expect(prompt).not.toHaveBeenCalled();
    });

    it('refuses an alias that ends with a slash', async () => {
      await expect(chooseUiInstall({ directory: 'libs/x', importAlias: '@x/' })).rejects.toThrow('should not end');
    });

    it('refuses a directory outside the workspace', async () => {
      await expect(chooseUiInstall({ directory: '../x', importAlias: '@x/ui' })).rejects.toThrow(
        'inside the workspace',
      );
    });
  });
});
