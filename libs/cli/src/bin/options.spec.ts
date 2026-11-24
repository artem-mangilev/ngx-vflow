import { parseOptions } from './options';

describe('parseOptions', () => {
  it('reads values after the flag or after =', () => {
    expect(parseOptions(['--importAlias', '@acme/ui', '--directory=libs/ui', '--project', 'app'])).toEqual({
      importAlias: '@acme/ui',
      directory: 'libs/ui',
      project: 'app',
    });
  });

  it('refuses unknown options, positional arguments and missing values', () => {
    expect(parseOptions(['--diff', '--overwrite=false'])).toEqual({ diff: true, overwrite: false });
    expect(() => parseOptions(['--color'])).toThrow('Unknown option --color');
    expect(() => parseOptions(['--buildable'])).toThrow('Unknown option --buildable');
    expect(() => parseOptions(['app'])).toThrow('Unexpected argument app');
    expect(() => parseOptions(['--project'])).toThrow('--project needs a value');
    expect(() => parseOptions(['--project', '--directory', 'x'])).toThrow('--project needs a value');
  });
});
