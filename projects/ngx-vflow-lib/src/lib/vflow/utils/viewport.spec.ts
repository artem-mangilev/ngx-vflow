import { getViewportForBounds } from './viewport';

describe('getViewportForBounds', () => {
  it('fits bounds with numeric padding and zoom limits', () => {
    expect(getViewportForBounds({ x: 100, y: 50, width: 200, height: 100 }, 800, 600, 0.5, 2, 0.1)).toEqual({
      x: 0,
      y: 100,
      zoom: 2,
    });
  });

  it('treats zero-sized bounds as a point at max zoom', () => {
    expect(getViewportForBounds({ x: 10, y: 20, width: 0, height: 0 }, 800, 600, 0.5, 2, 0)).toEqual({
      x: 380,
      y: 260,
      zoom: 2,
    });
  });

  it('rejects invalid bounds and viewport options', () => {
    const bounds = { x: 0, y: 0, width: 100, height: 100 };

    expect(() => getViewportForBounds(bounds, 0, 600, 0.5, 2, 0)).toThrowError(RangeError);
    expect(() => getViewportForBounds(bounds, 800, 600, 2, 0.5, 0)).toThrowError(RangeError);
    expect(() => getViewportForBounds({ ...bounds, width: -1 }, 800, 600, 0.5, 2, 0)).toThrowError(RangeError);
    expect(() => getViewportForBounds(bounds, 800, 600, 0.5, 2, -1)).toThrowError(RangeError);
  });
});
