import { SpatialIndex } from './spatial-index';

describe('SpatialIndex', () => {
  const rect = (x: number, y: number, width = 100, height = 50) => ({ x, y, width, height });

  it('finds items whose rects touch the queried rect and nothing else', () => {
    const index = new SpatialIndex<string>();
    index.set('a', rect(0, 0));
    index.set('b', rect(600, 0));
    index.set('c', rect(-2000, -2000));
    expect(index.query(rect(50, 25, 10, 10)).sort()).toEqual(['a']);
    // Closed intervals: a rect ending where another starts still intersects it.
    expect(index.query(rect(100, 50, 500, 10)).sort()).toEqual(['a', 'b']);
    expect(index.query(rect(-5000, -5000, 10000, 10000)).sort()).toEqual(['a', 'b', 'c']);
    expect(index.query(rect(3000, 3000))).toEqual([]);
  });

  it('moves items between cells and drops removed ones', () => {
    const index = new SpatialIndex<string>();
    expect(index.set('a', rect(0, 0))).toBeTrue();
    expect(index.set('a', rect(0, 0))).toBeFalse();
    expect(index.set('a', rect(5000, 5000))).toBeTrue();
    expect(index.query(rect(0, 0, 200, 200))).toEqual([]);
    expect(index.query(rect(4990, 4990, 20, 20))).toEqual(['a']);
    expect(index.rectOf('a')).toEqual(rect(5000, 5000));
    expect(index.delete('a')).toBeTrue();
    expect(index.delete('a')).toBeFalse();
    expect(index.query(rect(4990, 4990, 20, 20))).toEqual([]);
    expect(index.size).toBe(0);
  });

  it('reports an item spanning many cells once, wherever it is queried', () => {
    const index = new SpatialIndex<string>();
    index.set('group', rect(0, 0, 100000, 100000));
    index.set('point', rect(50000, 50000, 0, 0));
    expect(index.query(rect(50000, 50000, 1, 1)).sort()).toEqual(['group', 'point']);
    expect(index.query(rect(99000, 10, 1, 1))).toEqual(['group']);
    expect(index.query(rect(-10, -10, 1, 1))).toEqual([]);
    index.set('group', rect(200000, 0, 10, 10));
    expect(index.query(rect(99000, 10, 1, 1))).toEqual([]);
  });

  it('never matches a rect with a non-finite coordinate', () => {
    const index = new SpatialIndex<string>();
    index.set('nan', rect(NaN, 0));
    index.set('inf', rect(0, Infinity));
    expect(index.query(rect(-1e9, -1e9, 2e9, 2e9))).toEqual([]);
    expect(index.size).toBe(2);
    expect(index.delete('nan')).toBeTrue();
  });

  it('answers an unbounded or enormous query by scanning the items', () => {
    const index = new SpatialIndex<string>();
    index.set('a', rect(0, 0));
    index.set('b', rect(1e7, 1e7));
    expect(index.query(rect(-1e300, -1e300, 2e300, 2e300)).sort()).toEqual(['a', 'b']);
    expect(index.query(rect(-1e8, -1e8, 2e8, 2e8)).sort()).toEqual(['a', 'b']);
    expect(index.query(rect(-Infinity, -Infinity, Infinity, Infinity))).toEqual([]);
    expect(index.query(rect(NaN, 0, 10, 10))).toEqual([]);
  });
});
