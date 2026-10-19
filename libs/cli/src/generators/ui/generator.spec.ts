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
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { THEME_IMPORT } from '../../steps/tokens';
import { uiGenerator } from './generator';

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

/** Every template of the set, as paths inside `src`: `index.ts`, `lib/node.directive.ts`, … */
const PARTS = readdirSync(join(__dirname, '../../steps/templates/ui/src/lib')).map(
  (file) => `lib/${file.replace(/\.template$/, '')}`,
);

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

  it('asks for the ui section, writes vflow.json and keeps other sections', async () => {
    writeJson(tree, 'vflow.json', { skills: { path: '.claude' } });
    answer({ componentsPath: 'libs/flow-ui', importAlias: '@acme/flow-ui' });

    await uiGenerator(tree);

    expect(readJson(tree, 'vflow.json')).toEqual({
      skills: { path: '.claude' },
      ui: { componentsPath: 'libs/flow-ui', importAlias: '@acme/flow-ui' },
    });
    expect(vi.mocked(prompt).mock.calls[0][0]).toEqual([
      expect.objectContaining({ name: 'componentsPath', initial: 'libs/vflow-ui' }),
      expect.objectContaining({ name: 'importAlias' }),
    ]);
  });

  it('creates one library with the alias as import path and the whole set', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });

    await uiGenerator(tree);

    const project = readProjectConfiguration(tree, 'vflow-ui');
    expect(project.root).toBe('libs/vflow-ui');
    expect(project.targets?.['build']).toBeDefined();
    expect(readJson(tree, 'tsconfig.base.json').compilerOptions.paths['@vflow/ui']).toEqual([
      'libs/vflow-ui/src/index.ts',
    ]);
    expect(tree.read('libs/vflow-ui/src/index.ts', 'utf-8')).toContain("from './lib/node.directive'");
    for (const part of PARTS) expect(tree.exists(`libs/vflow-ui/src/${part}`)).toBe(true);
    expect(tree.children('libs/vflow-ui/src/lib').sort()).toEqual(PARTS.map((part) => part.slice(4)).sort());
  });

  it('creates a library without a build target with --buildable=false or the nx.json default', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree, { buildable: false });
    expect(readProjectConfiguration(tree, 'vflow-ui').targets?.['build']).toBeUndefined();

    const other = createTreeWithEmptyWorkspace();
    updateNxJson(other, { generators: { '@nx/angular': { library: { buildable: false } } } });
    await uiGenerator(other);
    expect(readProjectConfiguration(other, 'vflow-ui').targets?.['build']).toBeUndefined();
  });

  it('adds the tokens to the application and the parts to the workspace', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: { tailwindcss: '^4.1.0' } }));
    addProjectConfiguration(tree, 'shop', {
      root: 'apps/shop',
      sourceRoot: 'apps/shop/src',
      projectType: 'application',
    });
    tree.write('apps/shop/src/styles.css', "@import 'tailwindcss';\n");

    await uiGenerator(tree);

    expect(tree.read('apps/shop/src/styles.css', 'utf-8')).toContain(THEME_IMPORT);
    expect(tree.exists('apps/shop/src/vflow-ui.css')).toBe(true);
    expect(tree.exists('libs/vflow-ui/src/lib/node.directive.ts')).toBe(true);
  });

  it('adds the tokens to another application on a later run', async () => {
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

  it('fails before writing anything when the application has no Tailwind 4', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    addProjectConfiguration(tree, 'shop', {
      root: 'apps/shop',
      sourceRoot: 'apps/shop/src',
      projectType: 'application',
    });
    tree.write('apps/shop/src/styles.css', '');

    await expect(uiGenerator(tree)).rejects.toThrow('needs Tailwind CSS 4');
    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
  });

  it('takes --directory without asking for it', async () => {
    answer({ importAlias: '@vflow/ui' });

    await uiGenerator(tree, { directory: 'libs/shared/flow' });

    expect(vi.mocked(prompt).mock.calls[0][0]).not.toContainEqual(expect.objectContaining({ name: 'componentsPath' }));
    expect(readJson(tree, 'vflow.json').ui.componentsPath).toBe('libs/shared/flow');
    expect(tree.exists('libs/shared/flow/src/lib/node.directive.ts')).toBe(true);
  });

  it('takes --importAlias and --buildable without asking for them', async () => {
    answer({ componentsPath: 'libs/vflow-ui' });

    await uiGenerator(tree, { importAlias: '@acme/flow-ui', buildable: false });

    expect(vi.mocked(prompt).mock.calls[0][0]).toEqual([expect.objectContaining({ name: 'componentsPath' })]);
    expect(readJson(tree, 'vflow.json').ui).toEqual({ componentsPath: 'libs/vflow-ui', importAlias: '@acme/flow-ui' });
    expect(readProjectConfiguration(tree, 'vflow-ui').targets?.['build']).toBeUndefined();
  });

  it('asks nothing without an interactive terminal and takes the defaults', async () => {
    vi.stubEnv('NX_INTERACTIVE', 'false');

    await uiGenerator(tree, { importAlias: '@acme/flow-ui' });

    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
    expect(readJson(tree, 'vflow.json').ui).toEqual({ componentsPath: 'libs/vflow-ui', importAlias: '@acme/flow-ui' });
  });

  it('reads an existing ui section without asking', async () => {
    writeJson(tree, 'vflow.json', { ui: { componentsPath: 'libs/parts', importAlias: '@acme/parts' } });

    await uiGenerator(tree);

    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
    expect(tree.exists('libs/parts/src/index.ts')).toBe(true);
  });

  it('rejects an invalid ui section', async () => {
    const table = vi.spyOn(console, 'table').mockImplementation(() => undefined);
    writeJson(tree, 'vflow.json', { ui: { componentsPath: 3, importAlias: '@acme/' } });

    await expect(uiGenerator(tree)).rejects.toThrow('vflow.json validation failed');
    expect(table.mock.calls[0][0]).toEqual([
      expect.objectContaining({ path: 'ui.componentsPath' }),
      expect.objectContaining({ path: 'ui.importAlias' }),
    ]);
  });

  it('adds ngx-vflow when it is missing', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });

    await uiGenerator(tree);

    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toMatch(/^\^\d/);
  });

  it('refuses a later run into another folder than the installed set', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);

    await expect(uiGenerator(tree, { directory: 'libs/other' })).rejects.toThrow(
      '@vflow/ui is already installed in libs/vflow-ui',
    );
    expect(tree.exists('libs/other')).toBe(false);
    await uiGenerator(tree, { directory: './libs/vflow-ui/' });
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
    tree.write('libs/vflow-ui/src/index.ts', "export * from './lib/button.directive';\n");
    tree.delete('libs/vflow-ui/src/lib/edge.directive.ts');
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

    await uiGenerator(tree);

    expect(tree.read('libs/vflow-ui/src/lib/node.directive.ts', 'utf-8')).toBe('// edited');
    expect(tree.read('libs/vflow-ui/src/index.ts', 'utf-8')).toBe("export * from './lib/button.directive';\n");
    expect(tree.read('libs/vflow-ui/src/lib/edge.directive.ts', 'utf-8')).toContain('VuiEdge');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('./lib/edge.directive'));
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('./lib/button.directive'));
  });

  it('accepts double-quoted exports and ignores files of the application', async () => {
    answer({ componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' });
    await uiGenerator(tree);
    const exports = PARTS.map((part) => `export * from "./${part.replace(/\.ts$/, '')}";`).join('\n');
    tree.write('libs/vflow-ui/src/index.ts', exports);
    tree.write('libs/vflow-ui/src/lib/helpers.ts', 'export const mine = 1;\n');
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

    await uiGenerator(tree);

    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('does not export'));
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

  it('asks without the Nx question and maps the alias in the root tsconfig', async () => {
    await uiGenerator(tree, { angularCli: true });

    expect(vi.mocked(prompt).mock.calls[0][0]).not.toContainEqual(expect.objectContaining({ name: 'buildable' }));
    expect(readJson(tree, 'vflow.json')).toEqual({ ui: { componentsPath: 'libs/vflow-ui', importAlias: '@vflow/ui' } });
    expect(readJson(tree, 'tsconfig.json').compilerOptions.paths['@vflow/ui']).toEqual([
      './libs/vflow-ui/src/index.ts',
    ]);
    expect(tree.read('src/styles.css', 'utf-8')).toContain(THEME_IMPORT);
    for (const part of PARTS) expect(tree.exists(`libs/vflow-ui/src/${part}`)).toBe(true);
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
    expect(readJson(tree, 'tsconfig.app.json').include).toEqual(['src/**/*.ts', 'libs/vflow-ui/src/**/*.ts']);
  });

  it('refuses a first run into a folder that already has files', async () => {
    tree.write('libs/vflow-ui/README.md', 'mine');

    await expect(uiGenerator(tree, { angularCli: true })).rejects.toThrow('libs/vflow-ui already has files');
    expect(readJson(tree, 'tsconfig.json').compilerOptions.paths).toBeUndefined();
  });

  it('adds the parts to tsconfig.app.json and keeps the app sources', async () => {
    await uiGenerator(tree, { angularCli: true });
    await uiGenerator(tree, { angularCli: true });

    expect(readJson(tree, 'tsconfig.app.json').include).toEqual(['src/**/*.ts', 'libs/vflow-ui/src/**/*.ts']);
  });
});
