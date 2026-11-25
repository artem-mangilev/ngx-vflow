import { parseOptions, USAGE } from './options';

describe('parseOptions', () => {
  it('reads values after the flag or after =', () => {
    expect(parseOptions(['--importAlias', '@acme/ui', '--directory=libs/ui', '--project', 'app'])).toEqual({
      importAlias: '@acme/ui',
      directory: 'libs/ui',
      project: 'app',
    });
  });

  it('reads --stylesEntryPoint like the other valued options', () => {
    expect(parseOptions(['--stylesEntryPoint', 'src/styles.css'])).toEqual({ stylesEntryPoint: 'src/styles.css' });
  });

  it.each([
    [['--diff'], { diff: true }],
    [['--overwrite'], { overwrite: true }],
    [['--diff=true'], { diff: true }],
    [['--diff=false'], { diff: false }],
    [['--overwrite=false'], { overwrite: false }],
  ])('reads the switch %j', (args, expected) => {
    expect(parseOptions(args)).toEqual(expected);
  });

  it('returns no options for no arguments', () => {
    expect(parseOptions([])).toEqual({});
  });

  it('keeps an = inside the value', () => {
    expect(parseOptions(['--directory=libs/a=b'])).toEqual({ directory: 'libs/a=b' });
  });

  it.each(['--color', '--buildable'])('refuses the unknown option %s and prints the usage', (flag) => {
    expect(() => parseOptions([flag])).toThrow(`Unknown option ${flag}`);
    expect(() => parseOptions([flag])).toThrow(USAGE);
  });

  it('refuses a positional argument', () => {
    expect(() => parseOptions(['app'])).toThrow('Unexpected argument app');
  });

  it.each([[['--project']], [['--project', '--directory', 'x']]])('refuses a missing value in %j', (args) => {
    expect(() => parseOptions(args)).toThrow('--project needs a value');
  });
});
