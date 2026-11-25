import { getViewportForBounds } from './viewport';

describe('getViewportForBounds', () => {
  const size = { width: 800, height: 600 };
  const options = { minZoom: 0.5, maxZoom: 2, padding: 0 };
  const bounds = { x: 0, y: 0, width: 100, height: 100 };

  it('fits bounds with numeric padding and zoom limits', () => {
    expect(
      getViewportForBounds({ x: 100, y: 50, width: 200, height: 100 }, size, { ...options, padding: 0.1 }),
    ).toEqual({ x: 0, y: 100, zoom: 2 });
  });

  it('centers the bounds in the view', () => {
    // 400x300 bounds in 800x600 at zoom 2 fill it exactly; 100x100 at zoom 2 sit in the middle.
    expect(getViewportForBounds({ x: 10, y: 20, width: 100, height: 100 }, size, options)).toEqual({
      x: 800 / 2 - (10 + 50) * 2,
      y: 600 / 2 - (20 + 50) * 2,
      zoom: 2,
    });
  });

  it('zooms out to the smaller of the two fitting zooms', () => {
    // 1600 wide needs zoom 0.5, 100 high would allow 2: the width decides.
    expect(getViewportForBounds({ x: 0, y: 0, width: 1600, height: 100 }, size, options).zoom).toBe(0.5);
  });

  it('does not zoom out below the minimum zoom', () => {
    expect(getViewportForBounds({ x: 0, y: 0, width: 8000, height: 100 }, size, options).zoom).toBe(0.5);
  });

  it('treats zero-sized bounds as a point at max zoom', () => {
    expect(getViewportForBounds({ x: 10, y: 20, width: 0, height: 0 }, size, options)).toEqual({
      x: 380,
      y: 260,
      zoom: 2,
    });
  });

  it.each([
    ['a view without width', bounds, { width: 0, height: 600 }, options],
    ['a minimum zoom above the maximum', bounds, size, { ...options, minZoom: 2, maxZoom: 0.5 }],
    ['bounds with a negative width', { ...bounds, width: -1 }, size, options],
    ['a negative padding', bounds, size, { ...options, padding: -1 }],
  ])('throws a RangeError for %s', (_, boundsArg, sizeArg, optionsArg) => {
    expect(() => getViewportForBounds(boundsArg, sizeArg, optionsArg)).toThrowError(RangeError);
  });
});
