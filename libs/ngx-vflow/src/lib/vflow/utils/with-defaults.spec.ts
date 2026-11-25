import { suppliedEntries, withDefaults } from './with-defaults';

describe('withDefaults', () => {
  const defaults = { size: 10, label: 'none', enabled: true };

  it('takes the defaults when nothing is supplied', () => {
    expect(withDefaults(defaults, {})).toEqual(defaults);
  });

  it.each([null, undefined])('takes the defaults when the value is %s', (value) => {
    expect(withDefaults(defaults, value)).toEqual(defaults);
  });

  it('overrides only the supplied keys', () => {
    expect(withDefaults(defaults, { size: 20 })).toEqual({ size: 20, label: 'none', enabled: true });
  });

  it('keeps a falsy supplied value', () => {
    expect(withDefaults(defaults, { size: 0, label: '', enabled: false })).toEqual({
      size: 0,
      label: '',
      enabled: false,
    });
  });

  it('takes the default for a key set to undefined', () => {
    expect(withDefaults(defaults, { size: undefined })).toEqual(defaults);
  });

  it('does not change the defaults or the value', () => {
    const value = { size: 20 };

    withDefaults(defaults, value);

    expect(defaults).toEqual({ size: 10, label: 'none', enabled: true });
    expect(value).toEqual({ size: 20 });
  });
});

describe('suppliedEntries', () => {
  it('drops the entries set to undefined and keeps null', () => {
    expect(suppliedEntries({ a: 1, b: undefined, c: null })).toEqual({ a: 1, c: null });
  });

  it.each([null, undefined])('is empty for %s', (value) => {
    expect(suppliedEntries(value)).toEqual({});
  });
});
