import {
  addProjectConfiguration,
  logger,
  readJson,
  readProjectConfiguration,
  type Tree,
  updateJson,
  updateNxJson,
  writeJson,
} from '@nx/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { prompt } from 'enquirer';
import { THEME_IMPORT } from '../../steps/tokens';
import { uiGenerator } from './generator';

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

/** A minimal list of files every installed set has, as paths inside `src`. */
const CORE_FILES = ['index.ts', 'lib/node.directive.ts', 'lib/edge.directive.ts'];

/** Every file of the installed set under `directory`, as paths inside `src`. */
function setFiles(tree: Tree, directory: string): string[] {
  return ['index.ts', ...tree.children(`${directory}/src/lib`).map((file) => `lib/${file}`)];
}

/**
 * Where the alias points in tsconfig.base.json. The library generator of @nx/angular writes the path: with a
 * leading `./` since Nx 22, without it before.
 */
function aliasTarget(tree: Tree, alias: string): string[] {
  const paths: string[] = readJson(tree, 'tsconfig.base.json').compilerOptions.paths[alias];

  return paths.map((path) => path.replace(/^\.\//, ''));
}

function answer(values: Record<string, unknown>) {
  vi.mocked(prompt).mockResolvedValue(values);
}

describe('ui in Nx', () => {
  let tree: Tree;

  beforeEach(() => {
    vi.stubEnv('NX_INTERACTIVE', 'true');
    tree = createTreeWithEmptyWorkspace();
    updateJson(tree, 'package.json', (json) => ({
      ...json,
      dependencies: { '@angular/core': '~20.3.0', '@angular/common': '~20.3.0' },
    }));
  });

  it('asks where to put the set and stores no config of its own', async () => {
    answer({ componentsPath: 'libs/flow-ui', importAlias: '@acme/flow-ui' });

    await uiGenerator(tree);

    expect(aliasTarget(tree, '@acme/flow-ui')).toEqual(['libs/flow-ui/src/index.ts']);
    expect(tree.exists('vflow.json')).toBe(false);
    expect(vi.mocked(prompt).mock.calls[0][0]).toEqual([
      expect.objectContaining({ name: 'componentsPath', initial: 'libs/vflow-ui' }),
      expect.objectContaining({ name: 'importAlias' }),
    ]);
  });

  it('creates one library holding the set, with the alias as import path', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });

    await uiGenerator(tree);

    const project = readProjectConfiguration(tree, 'vflow-ui');
    expect(project.root).toBe('libs/vflow-ui');
    expect(aliasTarget(tree, '@vflow/ui')).toEqual(['libs/vflow-ui/src/index.ts']);
    for (const file of CORE_FILES) expect(tree.exists(`libs/vflow-ui/src/${file}`)).toBe(true);
    expect(tree.read('libs/vflow-ui/src/index.ts', 'utf-8')).toContain("from './lib/node.directive'");
  });

  it('creates the library with a build target by default', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });

    await uiGenerator(tree);

    expect(readProjectConfiguration(tree, 'vflow-ui').targets?.['build']).toBeDefined();
  });

  it('creates the library without a build target when nx.json says it is not buildable', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    updateNxJson(tree, { generators: { '@nx/angular': { library: { buildable: false } } } });

    await uiGenerator(tree);

    expect(readProjectConfiguration(tree, 'vflow-ui').targets?.['build']).toBeUndefined();
  });

  it('adds the tokens to another application on a later run without asking again', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: { tailwindcss: '^4.1.0' } }));
    for (const app of ['shop', 'admin']) {
      addProjectConfiguration(tree, app, {
        root: `apps/${app}`,
        sourceRoot: `apps/${app}/src`,
        projectType: 'application',
      });
      tree.write(`apps/${app}/src/styles.css`, "@import 'tailwindcss';\n");
    }

    await uiGenerator(tree, { project: 'shop' });
    await uiGenerator(tree, { project: 'admin' });

    expect(tree.read('apps/admin/src/styles.css', 'utf-8')).toContain(THEME_IMPORT);
    expect(vi.mocked(prompt)).toHaveBeenCalledTimes(1);
  });

  it('writes nothing when the application has no Tailwind 4', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    addProjectConfiguration(tree, 'shop', {
      root: 'apps/shop',
      sourceRoot: 'apps/shop/src',
      projectType: 'application',
    });
    tree.write('apps/shop/src/styles.css', '');

    await expect(uiGenerator(tree)).rejects.toThrow('needs Tailwind CSS 4');

    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
    expect(tree.exists('libs/vflow-ui')).toBe(false);
  });

  it('takes --directory without asking for it', async () => {
    answer({ importAlias: '@vflow/ui' });

    await uiGenerator(tree, { directory: 'libs/shared/flow' });

    expect(vi.mocked(prompt).mock.calls[0][0]).not.toContainEqual(expect.objectContaining({ name: 'componentsPath' }));
    expect(aliasTarget(tree, '@vflow/ui')).toEqual(['libs/shared/flow/src/index.ts']);
  });

  it('takes --importAlias without asking for it', async () => {
    answer({ componentsPath: 'libs/vflow-ui' });

    await uiGenerator(tree, { importAlias: '@acme/flow-ui' });

    expect(vi.mocked(prompt).mock.calls[0][0]).toEqual([expect.objectContaining({ name: 'componentsPath' })]);
    expect(aliasTarget(tree, '@acme/flow-ui')).toEqual(['libs/vflow-ui/src/index.ts']);
  });

  it('asks nothing without an interactive terminal and takes the defaults', async () => {
    vi.stubEnv('NX_INTERACTIVE', 'false');

    await uiGenerator(tree, { importAlias: '@acme/flow-ui' });

    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
    expect(aliasTarget(tree, '@acme/flow-ui')).toEqual(['libs/vflow-ui/src/index.ts']);
  });

  it('finds a moved and renamed set through the tsconfig paths without asking', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);
    for (const file of setFiles(tree, 'libs/vflow-ui')) {
      tree.rename(`libs/vflow-ui/src/${file}`, `libs/flow/parts/src/${file}`);
    }
    updateJson(tree, 'tsconfig.base.json', (json) => {
      json.compilerOptions.paths = { '@acme/flow': ['./libs/flow/parts/src/index.ts'] };
      return json;
    });
    tree.delete('libs/flow/parts/src/lib/edge.directive.ts');

    await uiGenerator(tree);

    expect(vi.mocked(prompt)).toHaveBeenCalledTimes(1);
    expect(tree.exists('libs/flow/parts/src/lib/edge.directive.ts')).toBe(true);
    expect(tree.exists('libs/vflow-ui/src/lib/edge.directive.ts')).toBe(false);
  });

  it('refuses an import alias that already maps to another path', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    updateJson(tree, 'tsconfig.base.json', (json) => {
      json.compilerOptions.paths = { '@vflow/ui': ['libs/mine/src/index.ts'] };
      return json;
    });

    await expect(uiGenerator(tree)).rejects.toThrow('@vflow/ui already maps to libs/mine/src/index.ts');
    expect(tree.exists('libs/vflow-ui')).toBe(false);
  });

  it('asks for --directory when the set is installed twice', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);
    for (const file of setFiles(tree, 'libs/vflow-ui')) {
      tree.write(`libs/copy/src/${file}`, tree.read(`libs/vflow-ui/src/${file}`)!);
    }
    updateJson(tree, 'tsconfig.base.json', (json) => {
      json.compilerOptions.paths['@acme/copy'] = ['libs/copy/src/index.ts'];
      return json;
    });

    await expect(uiGenerator(tree)).rejects.toThrow('installed more than once: libs/vflow-ui, libs/copy');
  });

  it('takes --directory to choose between two installed sets', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);
    for (const file of setFiles(tree, 'libs/vflow-ui')) {
      tree.write(`libs/copy/src/${file}`, tree.read(`libs/vflow-ui/src/${file}`)!);
    }
    updateJson(tree, 'tsconfig.base.json', (json) => {
      json.compilerOptions.paths['@acme/copy'] = ['libs/copy/src/index.ts'];
      return json;
    });
    tree.delete('libs/copy/src/lib/edge.directive.ts');

    await uiGenerator(tree, { directory: 'libs/copy' });

    expect(tree.exists('libs/copy/src/lib/edge.directive.ts')).toBe(true);
  });

  it('adds ngx-vflow to package.json as part of a run', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });

    await uiGenerator(tree);

    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBeDefined();
  });

  it('refuses a later run into another folder than the installed set', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);

    await expect(uiGenerator(tree, { directory: 'libs/other' })).rejects.toThrow(
      '@vflow/ui is already installed in libs/vflow-ui',
    );
    expect(tree.exists('libs/other')).toBe(false);
  });

  it('takes the installed folder written with a leading ./ and a trailing slash', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);

    await expect(uiGenerator(tree, { directory: './libs/vflow-ui/' })).resolves.toBeTypeOf('function');
  });

  it('refuses a first run into a folder that already has files', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    tree.write('libs/vflow-ui/src/index.ts', 'export const mine = 1;\n');

    await expect(uiGenerator(tree)).rejects.toThrow('libs/vflow-ui already has files');
    expect(tree.read('libs/vflow-ui/src/index.ts', 'utf-8')).toBe('export const mine = 1;\n');
    expect(tree.exists('libs/vflow-ui/src/lib/node.directive.ts')).toBe(false);
  });

  it('on a later run adds missing files only and keeps edited ones and the index', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);
    tree.write('libs/vflow-ui/src/lib/node.directive.ts', '// edited');
    tree.write('libs/vflow-ui/src/index.ts', "export * from './lib/node.directive';\n");
    tree.delete('libs/vflow-ui/src/lib/edge.directive.ts');
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

    await uiGenerator(tree);

    expect(tree.read('libs/vflow-ui/src/lib/node.directive.ts', 'utf-8')).toBe('// edited');
    expect(tree.read('libs/vflow-ui/src/index.ts', 'utf-8')).toBe("export * from './lib/node.directive';\n");
    expect(tree.read('libs/vflow-ui/src/lib/edge.directive.ts', 'utf-8')).toContain('VuiEdge');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('./lib/edge.directive'));
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('./lib/node.directive'));
  });

  describe('with an edited file and an edited index', () => {
    const node = 'libs/vflow-ui/src/lib/node.directive.ts';
    const index = 'libs/vflow-ui/src/index.ts';

    beforeEach(async () => {
      answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
      await uiGenerator(tree);
      tree.write(node, '// edited');
      tree.write(index, "export * from './lib/node.directive';\n");
    });

    it('reports edited files with a newer version', async () => {
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

      await uiGenerator(tree);

      expect(warn).toHaveBeenCalledWith(
        expect.stringMatching(/2 files with your changes have a newer version: .*node\.directive\.ts.*--overwrite/),
      );
    });

    it('replaces edited files with --overwrite but never the index', async () => {
      await uiGenerator(tree, { overwrite: true });

      expect(tree.read(node, 'utf-8')).toContain('VuiNode');
      expect(tree.read(index, 'utf-8')).toBe("export * from './lib/node.directive';\n");
    });

    it('prints the change and writes nothing with --diff', async () => {
      const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined);

      await uiGenerator(tree, { diff: true });

      expect(tree.read(node, 'utf-8')).toBe('// edited');
      expect(info).toHaveBeenCalledWith(expect.stringMatching(/--- libs\/vflow-ui\/src\/lib\/node\.directive\.ts/));
    });
  });

  it('with --diff on a workspace without the set adds nothing', async () => {
    const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: { tailwindcss: '^4.1.0' } }));

    await uiGenerator(tree, { diff: true });

    expect(info).toHaveBeenCalledWith(expect.stringContaining('not installed'));
    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBeUndefined();
    expect(prompt).not.toHaveBeenCalled();
  });

  describe('with an index that exports the parts', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
      await uiGenerator(tree);
      warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    });

    it('accepts double-quoted exports', async () => {
      const exports = tree
        .children('libs/vflow-ui/src/lib')
        .map((file) => `export * from "./lib/${file.replace(/\.ts$/, '')}";`)
        .join('\n');
      tree.write('libs/vflow-ui/src/index.ts', exports);

      await uiGenerator(tree);

      expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('does not export'));
    });

    it('does not ask the index to export files of the application', async () => {
      tree.write('libs/vflow-ui/src/lib/helpers.ts', 'export const mine = 1;\n');

      await uiGenerator(tree);

      expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('helpers'));
    });
  });
});

describe('ui in Angular CLI', () => {
  let tree: Tree;

  beforeEach(() => {
    vi.stubEnv('NX_INTERACTIVE', 'true');
    tree = createTree();
    writeJson(tree, 'package.json', {
      name: 'app',
      dependencies: { '@angular/core': '~20.3.0' },
      devDependencies: { tailwindcss: '^4.1.0' },
    });
    tree.write('src/styles.css', "@import 'tailwindcss';\n");
    writeJson(tree, 'angular.json', {
      version: 1,
      projects: { app: { root: '', sourceRoot: 'src', projectType: 'application', architect: {} } },
    });
    writeJson(tree, 'tsconfig.json', { compilerOptions: { strict: true } });
    writeJson(tree, 'tsconfig.app.json', { extends: './tsconfig.json', files: ['src/main.ts'] });
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
  });

  it.each(['../outside/ui', '/abs/ui', 'C:\\ui', 'libs/../../ui'])('refuses the directory %s', async (directory) => {
    await expect(uiGenerator(tree, { angularCli: true, directory })).rejects.toThrow('inside the workspace');
  });

  it('takes a directory with backslashes as the same folder on a second run', async () => {
    await uiGenerator(tree, { angularCli: true, directory: 'libs\\flow-ui' });

    expect(readJson(tree, 'tsconfig.json').compilerOptions.paths['@vflow/ui']).toEqual(['./libs/flow-ui/src/index.ts']);
    await expect(uiGenerator(tree, { angularCli: true, directory: 'libs\\flow-ui' })).resolves.toBeTypeOf('function');
  });

  it('maps the alias in the root tsconfig and stores no config of its own', async () => {
    await uiGenerator(tree, { angularCli: true });

    expect(tree.exists('vflow.json')).toBe(false);
    expect(readJson(tree, 'tsconfig.json').compilerOptions.paths['@vflow/ui']).toEqual([
      './libs/vflow-ui/src/index.ts',
    ]);
    for (const file of CORE_FILES) expect(tree.exists(`libs/vflow-ui/src/${file}`)).toBe(true);
  });

  it('keeps the comments of the tsconfig files', async () => {
    tree.write(
      'tsconfig.json',
      '/* Root config of the workspace. */\n{\n  // Shared by every project.\n  "compilerOptions": { "strict": true }\n}\n',
    );
    tree.write('tsconfig.app.json', '/* App config. */\n{ "extends": "./tsconfig.json", "files": ["src/main.ts"] }\n');

    await uiGenerator(tree, { angularCli: true });

    const root = tree.read('tsconfig.json', 'utf-8')!;
    expect(root).toContain('/* Root config of the workspace. */');
    expect(root).toContain('// Shared by every project.');
    expect(root).toContain('"@vflow/ui"');
    expect(tree.read('tsconfig.app.json', 'utf-8')).toContain('/* App config. */');
  });

  it('refuses a first run into a folder that already has files', async () => {
    tree.write('libs/vflow-ui/README.md', 'mine');

    await expect(uiGenerator(tree, { angularCli: true })).rejects.toThrow('libs/vflow-ui already has files');
    expect(readJson(tree, 'tsconfig.json').compilerOptions.paths).toBeUndefined();
  });

  it('adds the parts to tsconfig.app.json once across runs, beside the app sources', async () => {
    await uiGenerator(tree, { angularCli: true });
    await uiGenerator(tree, { angularCli: true });

    expect(readJson(tree, 'tsconfig.app.json').include).toEqual(['src/**/*.ts', 'libs/vflow-ui/src/**/*.ts']);
  });
});
