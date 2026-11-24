import { parseOptions } from './options';

describe('parseOptions', () => {
  it('reads values after the flag or after =, and buildable as a switch', () => {
    expect(
      parseOptions(['--importAlias', '@acme/ui', '--directory=libs/ui', '--project', 'app', '--buildable']),
    ).toEqual({ importAlias: '@acme/ui', directory: 'libs/ui', project: 'app', buildable: true });
    expect(parseOptions(['--no-buildable'])).toEqual({ buildable: false });
    expect(parseOptions(['--buildable=false'])).toEqual({ buildable: false });
  });

  it('refuses unknown options, positional arguments and missing values', () => {
    expect(() => parseOptions(['--color'])).toThrow('Unknown option --color');
    expect(() => parseOptions(['app'])).toThrow('Unexpected argument app');
    expect(() => parseOptions(['--project'])).toThrow('--project needs a value');
    expect(() => parseOptions(['--project', '--directory', 'x'])).toThrow('--project needs a value');
  });
});
