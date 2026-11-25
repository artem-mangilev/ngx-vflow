import { sameConnection } from './same-connection';

describe('sameConnection', () => {
  const connection = { source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' };

  it('is true for the same nodes and handles', () => {
    expect(sameConnection(connection, { ...connection })).toBe(true);
  });

  it.each([
    ['source', { source: 'c' }],
    ['target', { target: 'c' }],
    ['source handle', { sourceHandle: 'other' }],
    ['target handle', { targetHandle: 'other' }],
  ])('is false when the %s differs', (_, change) => {
    expect(sameConnection(connection, { ...connection, ...change })).toBe(false);
  });

  it('is false when only one has a handle', () => {
    expect(sameConnection(connection, { source: 'a', target: 'b' })).toBe(false);
  });

  it('is not symmetric in direction: swapped ends are another connection', () => {
    expect(sameConnection({ source: 'a', target: 'b' }, { source: 'b', target: 'a' })).toBe(false);
  });

  it.each([
    ['an empty id', { source: 'a', target: 'b', sourceHandle: '', targetHandle: '' }],
    ['an undefined id', { source: 'a', target: 'b', sourceHandle: undefined, targetHandle: undefined }],
    ['no id', { source: 'a', target: 'b' }],
  ])('counts %s as no handle', (_, other) => {
    expect(sameConnection({ source: 'a', target: 'b' }, other)).toBe(true);
  });
});
