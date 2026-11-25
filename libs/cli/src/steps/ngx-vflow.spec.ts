import { readJson, readJsonFile, type Tree, updateJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'node:path';
import { ensureNgxVflow } from './ngx-vflow';

describe('ngx-vflow step', () => {
  let tree: Tree;
  const { version } = readJsonFile<{ version: string }>(join(__dirname, '../../package.json'));
  const major = Number(version.split('.')[0]);

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('adds ngx-vflow in the version of the CLI', () => {
    expect(ensureNgxVflow(tree)).toBeTypeOf('function');

    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBe(`^${version}`);
  });

  it.each([
    ['dependencies', 'devDependencies'],
    ['devDependencies', 'dependencies'],
  ])('keeps ngx-vflow already in %s and does not add it to %s', (field, other) => {
    const range = `~${major}.0.0`;
    updateJson(tree, 'package.json', (json) => ({ ...json, [field]: { ...json[field], 'ngx-vflow': range } }));

    expect(ensureNgxVflow(tree)).toBeUndefined();

    const json = readJson(tree, 'package.json');
    expect(json[field]['ngx-vflow']).toBe(range);
    expect(json[other]['ngx-vflow']).toBeUndefined();
  });

  it('refuses ngx-vflow of an older major', () => {
    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { 'ngx-vflow': `^${major - 1}.4.0` } }));

    expect(() => ensureNgxVflow(tree)).toThrow(`need ngx-vflow ${major}`);
  });

  it('keeps ngx-vflow whose range has no version number', () => {
    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { 'ngx-vflow': 'latest' } }));

    expect(ensureNgxVflow(tree)).toBeUndefined();
    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBe('latest');
  });
});
