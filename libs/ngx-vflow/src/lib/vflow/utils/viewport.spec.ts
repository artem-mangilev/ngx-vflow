import { getViewportForBounds } from './viewport';

describe('getViewportForBounds', () => {
  it('fits bounds with numeric padding and zoom limits', () => {
    expect(
      getViewportForBounds(
        { x: 100, y: 50, width: 200, height: 100 },
        { width: 800, height: 600 },
        { minZoom: 0.5, maxZoom: 2, padding: 0.1 },
      ),
    ).toEqual({
      x: 0,
      y: 100,
      zoom: 2,
    });
  });

  it('treats zero-sized bounds as a point at max zoom', () => {
    expect(
      getViewportForBounds(
        { x: 10, y: 20, width: 0, height: 0 },
        { width: 800, height: 600 },
        { minZoom: 0.5, maxZoom: 2, padding: 0 },
      ),
    ).toEqual({
      x: 380,
      y: 260,
      zoom: 2,
    });
  });

  it('rejects invalid bounds and viewport options', () => {
    const bounds = { x: 0, y: 0, width: 100, height: 100 };

    expect(() =>
      getViewportForBounds(bounds, { width: 0, height: 600 }, { minZoom: 0.5, maxZoom: 2, padding: 0 }),
    ).toThrowError(RangeError);
    expect(() =>
      getViewportForBounds(bounds, { width: 800, height: 600 }, { minZoom: 2, maxZoom: 0.5, padding: 0 }),
    ).toThrowError(RangeError);
    expect(() =>
      getViewportForBounds(
        { ...bounds, width: -1 },
        { width: 800, height: 600 },
        { minZoom: 0.5, maxZoom: 2, padding: 0 },
      ),
    ).toThrowError(RangeError);
    expect(() =>
      getViewportForBounds(bounds, { width: 800, height: 600 }, { minZoom: 0.5, maxZoom: 2, padding: -1 }),
    ).toThrowError(RangeError);
  });
});
