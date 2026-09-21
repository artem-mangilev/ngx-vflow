import { resolveFeatureEntries } from './resolve-feature-entries';

describe('resolveFeatureEntries', () => {
  it('orders by precedence category, then by registration position', () => {
    const resolved = resolveFeatureEntries([
      { id: 'a' },
      { id: 'b', precedence: 'lowest' },
      { id: 'c', precedence: 'high' },
      { id: 'd', precedence: 'default' },
      { id: 'e', precedence: 'highest' },
      { id: 'f', precedence: 'high' },
    ]);

    expect(resolved.map((entry) => entry.id)).toEqual(['e', 'c', 'f', 'a', 'd', 'b']);
  });

  it('keeps the input untouched and returns a new array', () => {
    const entries = [{ id: 'b', precedence: 'low' as const }, { id: 'a' }];
    const resolved = resolveFeatureEntries(entries);

    expect(entries.map((entry) => entry.id)).toEqual(['b', 'a']);
    expect(resolved).not.toBe(entries);
  });

  it('rejects two entries with one id', () => {
    expect(() => resolveFeatureEntries([{ id: 'snap' }, { id: 'snap', precedence: 'high' }])).toThrowError(
      /"snap" is registered twice/,
    );
  });
});
