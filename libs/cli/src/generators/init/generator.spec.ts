import { addProjectConfiguration, readJson, readJsonFile, type Tree, updateJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'node:path';
import { THEME_IMPORT } from './theme';
import { initGenerator } from './generator';

describe('init', () => {
  let tree: Tree;
  const { version } = readJsonFile<{ version: string }>(join(__dirname, '../../../package.json'));
  const major = Number(version.split('.')[0]);

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    updateJson(tree, 'package.json', (json) => ({ ...json, devDependencies: { tailwindcss: '^4.1.0' } }));
    addProjectConfiguration(tree, 'app', { root: 'apps/app', sourceRoot: 'apps/app/src', projectType: 'application' });
    tree.write('apps/app/src/styles.css', "@import 'tailwindcss';\n");
  });

  it('adds ngx-vflow in the version of the CLI and the theme', async () => {
    await initGenerator(tree);

    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBe(`^${version}`);
    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toContain(THEME_IMPORT);
  });

  it.each(['dependencies', 'devDependencies'])('keeps ngx-vflow already in %s', async (field) => {
    const range = `~${major}.0.0`;
    updateJson(tree, 'package.json', (json) => ({ ...json, [field]: { ...json[field], 'ngx-vflow': range } }));

    await initGenerator(tree);

    const json = readJson(tree, 'package.json');
    expect(json[field]['ngx-vflow']).toBe(range);
    expect(field === 'dependencies' ? json.devDependencies['ngx-vflow'] : json.dependencies['ngx-vflow']).toBe(
      undefined,
    );
  });

  it('refuses ngx-vflow of an older major and keeps one without a version number', async () => {
    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { 'ngx-vflow': `^${major - 1}.4.0` } }));
    await expect(initGenerator(tree)).rejects.toThrow(`need ngx-vflow ${major}`);

    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { 'ngx-vflow': 'latest' } }));
    await initGenerator(tree);
    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBe('latest');
  });

  it('adds @angular/cdk in the major of the application Angular, and keeps an existing one', async () => {
    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { '@angular/core': '~20.3.0' } }));

    await initGenerator(tree);
    expect(readJson(tree, 'package.json').dependencies['@angular/cdk']).toBe('^20.0.0');

    updateJson(tree, 'package.json', (json) => ({
      ...json,
      dependencies: { ...json.dependencies, '@angular/cdk': '~20.2.0' },
    }));
    await initGenerator(tree);
    expect(readJson(tree, 'package.json').dependencies['@angular/cdk']).toBe('~20.2.0');
  });

  it('does not create vflow.json', async () => {
    await initGenerator(tree);

    expect(tree.exists('vflow.json')).toBe(false);
  });
});
