import { createTree } from '@nx/devkit/testing';
import { setJsoncValue } from './jsonc';

describe('setJsoncValue', () => {
  it('sets a nested value and keeps the comments around it', () => {
    const tree = createTree();
    tree.write('tsconfig.json', '/* root */\n{\n  // strict mode\n  "compilerOptions": { "strict": true }\n}\n');

    setJsoncValue(tree, 'tsconfig.json', ['compilerOptions', 'paths'], () => ({ '@a': ['a.ts'] }));

    const text = tree.read('tsconfig.json', 'utf-8')!;
    expect(text).toContain('/* root */');
    expect(text).toContain('// strict mode');
    expect(text).toContain('"strict": true');
    expect(text).toContain('"@a"');
  });

  it('hands the parsed current content to the value function', () => {
    const tree = createTree();
    tree.write('tsconfig.json', '{ // c\n "include": ["a"] }');

    setJsoncValue(tree, 'tsconfig.json', ['include'], (current) => [...current.include, 'b']);

    expect(tree.read('tsconfig.json', 'utf-8')).toMatch(/"include": \[\s*"a",\s*"b"\s*\]/);
  });

  it('replaces an existing value', () => {
    const tree = createTree();
    tree.write('tsconfig.json', '{ "extends": "./a.json" }');

    setJsoncValue(tree, 'tsconfig.json', ['extends'], () => './b.json');

    expect(tree.read('tsconfig.json', 'utf-8')).toContain('"./b.json"');
    expect(tree.read('tsconfig.json', 'utf-8')).not.toContain('./a.json');
  });

  it('starts from an empty object when the file does not exist', () => {
    const tree = createTree();

    setJsoncValue(tree, 'tsconfig.json', ['include'], () => ['src']);

    expect(JSON.parse(tree.read('tsconfig.json', 'utf-8')!)).toEqual({ include: ['src'] });
  });
});
