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

  it.each(['dependencies', 'devDependencies'])('keeps ngx-vflow already in %s', (field) => {
    const range = `~${major}.0.0`;
    updateJson(tree, 'package.json', (json) => ({ ...json, [field]: { ...json[field], 'ngx-vflow': range } }));

    expect(ensureNgxVflow(tree)).toBeUndefined();

    const json = readJson(tree, 'package.json');
    expect(json[field]['ngx-vflow']).toBe(range);
    expect(field === 'dependencies' ? json.devDependencies['ngx-vflow'] : json.dependencies['ngx-vflow']).toBe(
      undefined,
    );
  });

  it('refuses ngx-vflow of an older major and keeps one without a version number', () => {
    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { 'ngx-vflow': `^${major - 1}.4.0` } }));
    expect(() => ensureNgxVflow(tree)).toThrow(`need ngx-vflow ${major}`);

    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { 'ngx-vflow': 'latest' } }));
    ensureNgxVflow(tree);
    expect(readJson(tree, 'package.json').dependencies['ngx-vflow']).toBe('latest');
  });

  it('adds @angular/cdk in the major of the application Angular, and keeps an existing one', () => {
    updateJson(tree, 'package.json', (json) => ({ ...json, dependencies: { '@angular/core': '~20.3.0' } }));

    ensureNgxVflow(tree);
    expect(readJson(tree, 'package.json').dependencies['@angular/cdk']).toBe('^20.0.0');

    updateJson(tree, 'package.json', (json) => ({
      ...json,
      dependencies: { ...json.dependencies, '@angular/cdk': '~20.2.0' },
    }));
    ensureNgxVflow(tree);
    expect(readJson(tree, 'package.json').dependencies['@angular/cdk']).toBe('~20.2.0');
  });
});
