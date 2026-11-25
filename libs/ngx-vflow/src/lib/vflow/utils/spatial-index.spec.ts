import { SpatialIndex } from './spatial-index';

describe('SpatialIndex', () => {
  const rect = (x: number, y: number, width = 100, height = 50) => ({ x, y, width, height });

  describe('query', () => {
    it('finds an item whose rect overlaps the queried rect', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));
      index.set('b', rect(600, 0));

      expect(index.query(rect(50, 25, 10, 10))).toEqual(['a']);
    });

    it('treats rects as closed intervals: a rect ending where another starts still intersects it', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));
      index.set('b', rect(600, 0));

      expect(index.query(rect(100, 50, 500, 10)).sort()).toEqual(['a', 'b']);
    });

    it('finds items far from the origin', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));
      index.set('far', rect(-2000, -2000));

      expect(index.query(rect(-5000, -5000, 10000, 10000)).sort()).toEqual(['a', 'far']);
    });

    it('finds nothing in an empty area', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));

      expect(index.query(rect(3000, 3000))).toEqual([]);
    });

    it('finds nothing in an empty index', () => {
      expect(new SpatialIndex<string>().query(rect(0, 0))).toEqual([]);
    });

    it('reports an item that spans many cells once, wherever it is queried', () => {
      const index = new SpatialIndex<string>();
      index.set('group', rect(0, 0, 100000, 100000));
      index.set('point', rect(50000, 50000, 0, 0));

      expect(index.query(rect(50000, 50000, 1, 1)).sort()).toEqual(['group', 'point']);
      expect(index.query(rect(99000, 10, 1, 1))).toEqual(['group']);
    });
  });

  describe('set', () => {
    it('reports whether the rect changed', () => {
      const index = new SpatialIndex<string>();

      expect(index.set('a', rect(0, 0))).toBe(true);
      expect(index.set('a', rect(0, 0))).toBe(false);
      expect(index.set('a', rect(5, 0))).toBe(true);
    });

    it('moves the item out of its old place', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));

      index.set('a', rect(5000, 5000));

      expect(index.query(rect(0, 0, 200, 200))).toEqual([]);
      expect(index.query(rect(4990, 4990, 20, 20))).toEqual(['a']);
    });

    it('moves a group out of the cells it covered', () => {
      const index = new SpatialIndex<string>();
      index.set('group', rect(0, 0, 100000, 100000));

      index.set('group', rect(200000, 0, 10, 10));

      expect(index.query(rect(99000, 10, 1, 1))).toEqual([]);
    });
  });

  describe('rectOf', () => {
    it('returns the stored rect', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(5000, 5000));

      expect(index.rectOf('a')).toEqual(rect(5000, 5000));
    });
  });

  describe('delete', () => {
    it('drops the item and reports it', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));

      expect(index.delete('a')).toBe(true);
      expect(index.query(rect(0, 0, 10, 10))).toEqual([]);
      expect(index.size).toBe(0);
    });

    it('reports an item that is not there', () => {
      expect(new SpatialIndex<string>().delete('a')).toBe(false);
    });
  });

  describe('a rect with a non-finite coordinate', () => {
    it('is stored but never matched', () => {
      const index = new SpatialIndex<string>();
      index.set('nan', rect(NaN, 0));
      index.set('inf', rect(0, Infinity));

      expect(index.query(rect(-1e9, -1e9, 2e9, 2e9))).toEqual([]);
      expect(index.size).toBe(2);
    });

    it('can be deleted', () => {
      const index = new SpatialIndex<string>();
      index.set('nan', rect(NaN, 0));

      expect(index.delete('nan')).toBe(true);
    });
  });

  describe('an enormous or unbounded query', () => {
    it.each([
      ['beyond a finite scale', rect(-1e300, -1e300, 2e300, 2e300)],
      ['larger than the grid', rect(-1e8, -1e8, 2e8, 2e8)],
    ])('returns every item for a query %s', (_, query) => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));
      index.set('b', rect(1e7, 1e7));

      expect(index.query(query).sort()).toEqual(['a', 'b']);
    });

    it('returns nothing for a query that is not a number', () => {
      const index = new SpatialIndex<string>();
      index.set('a', rect(0, 0));

      expect(index.query(rect(NaN, 0, 10, 10))).toEqual([]);
      expect(index.query(rect(-Infinity, -Infinity, Infinity, Infinity))).toEqual([]);
    });
  });
});
