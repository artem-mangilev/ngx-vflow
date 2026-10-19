import { addProjectConfiguration, logger, type Tree, updateJson, writeJson } from '@nx/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { prompt } from 'enquirer';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { allowsTailwind4, ensureUiTokens, THEME_IMPORT } from './tokens';

const TOKENS = readFileSync(join(__dirname, 'templates/vflow-ui.css'), 'utf-8');

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

function addApp(tree: Tree, name: string, styles?: string[]) {
  addProjectConfiguration(tree, name, {
    root: `apps/${name}`,
    sourceRoot: `apps/${name}/src`,
    projectType: 'application',
    targets: styles ? { build: { executor: '@angular/build:application', options: { styles } } } : {},
  });
}

describe('tokens step', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: { tailwindcss: '^4.1.0' } }));
  });

  it('copies the tokens file next to the stylesheet and imports it right after Tailwind', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', "@import 'tailwindcss';\n\nbody {\n  margin: 0;\n}\n");

    await ensureUiTokens(tree);

    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe(
      `@import 'tailwindcss';\n${THEME_IMPORT}\n\nbody {\n  margin: 0;\n}\n`,
    );
    expect(tree.read('apps/app/src/vflow-ui.css', 'utf-8')).toBe(TOKENS);
    expect(TOKENS).toContain('@theme inline');
    expect(TOKENS).not.toMatch(/@import ['"]@vflow\/cli/);
  });

  it('skips a leading comment, @charset and layer statements', async () => {
    addApp(tree, 'app');
    tree.write(
      'apps/app/src/styles.css',
      "/* You can add global styles to this file */\n@charset 'utf-8';\n@layer theme, base;\n@import 'tailwindcss';\n.a {\n  color: red;\n}\n",
    );

    await ensureUiTokens(tree);

    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toContain(`@import 'tailwindcss';\n${THEME_IMPORT}\n.a {`);
  });

  it('requires Tailwind CSS 4', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', '');

    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: { tailwindcss: '^3.4.17' } }));
    await expect(ensureUiTokens(tree)).rejects.toThrow('this workspace has tailwindcss ^3.4.17');
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: {} }));
    await expect(ensureUiTokens(tree)).rejects.toThrow('needs Tailwind CSS 4');
    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe('');
  });

  it.each([
    ['^4.1.0', true],
    ['>=3.4.0', true],
    ['>=3.0.0 <5', true],
    ['^3.4.0 || ^4.0.0', true],
    ['latest', true],
    ['^3.4.17', false],
    ['>=3 <4', false],
    ['~3.4.0', false],
  ])('reads the range %s as allowing Tailwind 4: %s', (range, allowed) => {
    expect(allowsTailwind4(range)).toBe(allowed);
  });

  it('trusts the installed Tailwind over the range', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', '');
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: { tailwindcss: '>=3.4.0' } }));
    writeJson(tree, 'node_modules/tailwindcss/package.json', { version: '3.4.17' });

    await expect(ensureUiTokens(tree)).rejects.toThrow('this workspace has tailwindcss 3.4.17');
    writeJson(tree, 'node_modules/tailwindcss/package.json', { version: '4.1.3' });
    await ensureUiTokens(tree);
    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe(`${THEME_IMPORT}\n`);
  });

  it('prefers a CSS stylesheet of the build options over a conventional Sass one', async () => {
    addApp(tree, 'app', ['apps/app/src/styles.scss', 'apps/app/src/tailwind.css']);
    tree.write('apps/app/src/styles.scss', "@use 'sass:math';\n");
    tree.write('apps/app/src/tailwind.css', "@import 'tailwindcss';\n");

    await ensureUiTokens(tree);

    expect(tree.read('apps/app/src/tailwind.css', 'utf-8')).toContain(THEME_IMPORT);
    expect(tree.read('apps/app/src/styles.scss', 'utf-8')).toBe("@use 'sass:math';\n");
  });

  it('ignores a stylesheet of a sibling project whose root starts the same', async () => {
    addApp(tree, 'shop', ['apps/shop-admin/src/styles.css']);
    tree.write('apps/shop-admin/src/styles.css', '');

    await expect(ensureUiTokens(tree)).rejects.toThrow('--stylesEntryPoint');
  });

  it('refuses a Sass or Less stylesheet', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.scss', "@use 'sass:math';\n");

    await expect(ensureUiTokens(tree)).rejects.toThrow('apps/app/src/styles.scss is not a CSS file');
    expect(tree.read('apps/app/src/styles.scss', 'utf-8')).toBe("@use 'sass:math';\n");
  });

  it('puts the import first in a stylesheet without leading imports', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', '');

    await ensureUiTokens(tree);

    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe(`${THEME_IMPORT}\n`);
  });

  it('keeps an existing tokens file and does not import it twice', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', "@import 'tailwindcss';\n");

    await ensureUiTokens(tree);
    const once = tree.read('apps/app/src/styles.css', 'utf-8');
    tree.write('apps/app/src/vflow-ui.css', ':root { --vui-accent: hotpink; }\n');
    await ensureUiTokens(tree);

    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe(once);
    expect(tree.read('apps/app/src/vflow-ui.css', 'utf-8')).toBe(':root { --vui-accent: hotpink; }\n');
  });

  it('finds the stylesheet in the build options', async () => {
    addApp(tree, 'app', ['node_modules/some-lib/styles.css', { input: 'apps/app/src/global/theme.css' } as never]);
    tree.write('node_modules/some-lib/styles.css', '');
    tree.write('apps/app/src/global/theme.css', "@import 'tailwindcss';\n");

    await ensureUiTokens(tree);

    expect(tree.read('apps/app/src/global/theme.css', 'utf-8')).toContain(THEME_IMPORT);
    expect(tree.exists('apps/app/src/global/vflow-ui.css')).toBe(true);
    expect(tree.read('node_modules/some-lib/styles.css', 'utf-8')).toBe('');
  });

  it('uses --stylesEntryPoint and rejects a missing one', async () => {
    addApp(tree, 'app');
    tree.write('apps/app/src/styles.css', '');
    tree.write('apps/app/src/flow.css', "@import 'tailwindcss';\n");

    await ensureUiTokens(tree, { stylesEntryPoint: 'apps/app/src/flow.css' });

    expect(tree.read('apps/app/src/flow.css', 'utf-8')).toContain(THEME_IMPORT);
    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toBe('');
    await expect(ensureUiTokens(tree, { stylesEntryPoint: 'apps/app/src/missing.css' })).rejects.toThrow(
      'does not exist',
    );
  });

  it('fails with a hint when the application has no stylesheet', async () => {
    addApp(tree, 'app');

    await expect(ensureUiTokens(tree)).rejects.toThrow('--stylesEntryPoint');
  });

  it('asks for the application when there are several and ignores libraries', async () => {
    vi.stubEnv('NX_INTERACTIVE', 'true');
    addApp(tree, 'admin');
    addApp(tree, 'shop');
    addProjectConfiguration(tree, 'shared', { root: 'libs/shared', projectType: 'library' });
    tree.write('apps/shop/src/styles.css', '');
    vi.mocked(prompt).mockResolvedValue({ project: 'shop' });

    await ensureUiTokens(tree);

    expect(vi.mocked(prompt)).toHaveBeenCalledWith(expect.objectContaining({ choices: ['admin', 'shop'] }));
    expect(tree.read('apps/shop/src/styles.css', 'utf-8')).toContain(THEME_IMPORT);
  });

  it('requires --project for several applications without an interactive terminal', async () => {
    vi.stubEnv('NX_INTERACTIVE', 'false');
    addApp(tree, 'admin');
    addApp(tree, 'shop');

    await expect(ensureUiTokens(tree)).rejects.toThrow('Pass --project with one of: admin, shop');
    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
  });

  it('takes --project without asking and rejects an unknown one', async () => {
    addApp(tree, 'admin');
    addApp(tree, 'shop');
    tree.write('apps/admin/src/styles.css', '');

    await ensureUiTokens(tree, { project: 'admin' });

    expect(vi.mocked(prompt)).not.toHaveBeenCalled();
    expect(tree.read('apps/admin/src/styles.css', 'utf-8')).toContain(THEME_IMPORT);
    await expect(ensureUiTokens(tree, { project: 'shared' })).rejects.toThrow('Choose one of: admin, shop');
  });

  it('skips a workspace without applications with a hint', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: {} }));

    await ensureUiTokens(tree);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('--project'));
    expect(tree.exists('vflow-ui.css')).toBe(false);
  });

  it('works in an Angular CLI workspace', async () => {
    const cli = createTree();
    writeJson(cli, 'package.json', { name: 'app', dependencies: {}, devDependencies: { tailwindcss: '^4.1.0' } });
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

    await ensureUiTokens(cli);

    expect(cli.read('src/styles.css', 'utf-8')).toContain(`@import 'tailwindcss';\n${THEME_IMPORT}`);
  });
});
