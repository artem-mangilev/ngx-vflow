import { addProjectConfiguration, readJson, readJsonFile, type Tree, updateJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'node:path';
import { PRESET_IMPORT } from '../ui-theme/generator';
import { initGenerator } from './generator';

describe('init', () => {
  let tree: Tree;
  const { version } = readJsonFile<{ version: string }>(join(__dirname, '../../../package.json'));

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'app', { root: 'apps/app', sourceRoot: 'apps/app/src', projectType: 'application' });
    tree.write('apps/app/src/styles.css', "@import 'tailwindcss';\n");
  });

  it('adds ngx-vflow in the version of the CLI and the theme', async () => {
    await initGenerator(tree);

    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBe(`^${version}`);
    expect(tree.read('apps/app/src/styles.css', 'utf-8')).toContain(PRESET_IMPORT);
  });

  it.each(['dependencies', 'devDependencies'])('keeps ngx-vflow already in %s', async (field) => {
    updateJson(tree, 'package.json', (json) => ({ ...json, [field]: { ...json[field], 'ngx-vflow': '~2.6.0' } }));

    await initGenerator(tree);

    const json = readJson(tree, 'package.json');
    expect(json[field]['ngx-vflow']).toBe('~2.6.0');
    expect(field === 'dependencies' ? json.devDependencies['ngx-vflow'] : json.dependencies['ngx-vflow']).toBe(
      undefined,
    );
  });

  it('does not create vflow.json', async () => {
    await initGenerator(tree);

    expect(tree.exists('vflow.json')).toBe(false);
  });
});
