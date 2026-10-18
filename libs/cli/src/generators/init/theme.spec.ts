import { addProjectConfiguration, type Tree, writeJson } from '@nx/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { prompt } from 'enquirer';
import { addUiTheme, PRESET_IMPORT } from './theme';

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

function addApp(tree: Tree, name: string, styles?: string[]) {
  addProjectConfiguration(tree, name, {
    root: `apps/${name}`,
    sourceRoot: `apps/${name}/src`,
    projectType: 'application',
    targets: styles ? { build: { executor: '@angular/build:application', options: { styles } } } : {},
  });
}

describe('theme of init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('imports the preset right after Tailwind and appends the theme values', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', "@import 'tailwindcss';\n\nbody {\n  margin: 0;\n}\n");

    await addUiTheme(tree);

    const css = tree.read('apps/app/src/styles.css', 'utf-8')!;
    expect(css.startsWith(`@import 'tailwindcss';\n${PRESET_IMPORT}\n\nbody {`)).toBe(true);
    expect(css).toContain(":root,\n[data-vui-theme='light'] {");
    expect(css.trimEnd().endsWith('}')).toBe(true);
    expect(css.indexOf("[data-vui-theme='dark']")).toBeGreaterThan(css.indexOf('margin: 0'));
  });

  it('skips a leading comment, @charset, @use and layer statements', async () => {
    addApp(tree, 'app');
    tree.write(
      'apps/app/src/styles.scss',
      "/* You can add global styles to this file */\n@charset 'utf-8';\n@use 'sass:math';\n// layers\n@layer theme, base;\n@import 'tailwindcss';\n.a {\n  color: red;\n}\n",
    );

    await addUiTheme(tree);

    const css = tree.read('apps/app/src/styles.scss', 'utf-8')!;
    expect(css).toContain(`@import 'tailwindcss';\n${PRESET_IMPORT}\n.a {`);
  });

  it('puts the preset first in a stylesheet without leading imports', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', '');

    await addUiTheme(tree);

    expect(tree.read('apps/app/src/styles.css', 'utf-8')!.startsWith(`${PRESET_IMPORT}\n\n/*`)).toBe(true);
  });

  it('does not import the preset or append the values twice', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', "@import 'tailwindcss';\n");

    await addUiTheme(tree);
    const once = tree.read('apps/app/src/styles.css', 'utf-8');
    await addUiTheme(tree);

    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe(once);
  });

  it('finds the stylesheet in the build options', async () => {
    addApp(tree, 'app', ['node_modules/some-lib/styles.css', { input: 'apps/app/src/global/theme.css' } as never]);
    tree.write('node_modules/some-lib/styles.css', '');
    tree.write('apps/app/src/global/theme.css', "@import 'tailwindcss';\n");

    await addUiTheme(tree);

    expect(tree.read('apps/app/src/global/theme.css', 'utf-8')).toContain(PRESET_IMPORT);
    expect(tree.read('node_modules/some-lib/styles.css', 'utf-8')).toBe('');
  });

  it('uses --stylesEntryPoint and rejects a missing one', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', '');
    tree.write('apps/app/src/flow.css', "@import 'tailwindcss';\n");

    await addUiTheme(tree, { stylesEntryPoint: 'apps/app/src/flow.css' });

    expect(tree.read('apps/app/src/flow.css', 'utf-8')).toContain(PRESET_IMPORT);
    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe('');
    await expect(addUiTheme(tree, { stylesEntryPoint: 'apps/app/src/missing.css' })).rejects.toThrow('does not exist');
  });

  it('fails with a hint when the application has no stylesheet', async () => {
    addApp(tree, 'app');

    await expect(addUiTheme(tree)).rejects.toThrow('--stylesEntryPoint');
  });

  it('asks for the application when there are several and ignores libraries', async () => {
    addApp(tree, 'admin');
    addApp(tree, 'shop');
    addProjectConfiguration(tree, 'shared', { root: 'libs/shared', projectType: 'library' });
    tree.write('apps/shop/src/styles.css', '');
    vi.mocked(prompt).mockResolvedValue({ project: 'shop' });

    await addUiTheme(tree);

    expect(vi.mocked(prompt)).toHaveBeenCalledWith(expect.objectContaining({ choices: ['admin', 'shop'] }));
    expect(tree.read('apps/shop/src/styles.css', 'utf-8')).toContain(PRESET_IMPORT);
  });

  it('takes --project without asking and rejects an unknown one', async () => {
    addApp(tree, 'admin');
    addApp(tree, 'shop');
    tree.write('apps/admin/src/styles.css', '');

    await addUiTheme(tree, { project: 'admin' });

    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
    expect(tree.read('apps/admin/src/styles.css', 'utf-8')).toContain(PRESET_IMPORT);
    await expect(addUiTheme(tree, { project: 'shared' })).rejects.toThrow('Choose one of: admin, shop');
  });

  it('works in an Angular CLI workspace', async () => {
    const cli = createTree();
    writeJson(cli, 'package.json', { name: 'app', dependencies: {} });
    writeJson(cli, 'angular.json', {
      version: 1,
      projects: {
        app: {
          root: '',
          sourceRoot: 'src',
          projectType: 'application',
          architect: { build: { builder: '@angular/build:application', options: { styles: ['src/styles.css'] } } },
        },
      },
    });
    cli.write('src/styles.css', "@import 'tailwindcss';\n");

    await addUiTheme(cli);

    expect(cli.read('src/styles.css', 'utf-8')).toContain(`@import 'tailwindcss';\n${PRESET_IMPORT}`);
  });
});
