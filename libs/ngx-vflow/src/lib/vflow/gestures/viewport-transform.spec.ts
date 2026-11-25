import { clampZoom, toFlowPoint, translateBy, zoomAround } from './viewport-transform';

describe('viewport transform', () => {
  it('converts pane points to flow points', () => {
    expect(toFlowPoint({ x: 30, y: -20, zoom: 2 }, { x: 130, y: 80 })).toEqual({ x: 50, y: 50 });
  });

  it('zooms around a pane point', () => {
    expect(zoomAround({ x: 10, y: 20, zoom: 1 }, 2, { x: 110, y: 70 })).toEqual({ x: -90, y: -30, zoom: 2 });
  });

  it('keeps the flow point under the anchor of a zoom in place', () => {
    const state = { x: 10, y: 20, zoom: 1 };

    const next = zoomAround(state, 2, { x: 110, y: 70 });

    expect(toFlowPoint(next, { x: 110, y: 70 })).toEqual(toFlowPoint(state, { x: 110, y: 70 }));
  });

  it('returns the same state for a zoom to the current zoom', () => {
    const state = { x: 10, y: 20, zoom: 1 };

    expect(zoomAround(state, 1, { x: 5, y: 5 })).toBe(state);
  });

  it('translates in pane pixels', () => {
    expect(translateBy({ x: 1, y: 2, zoom: 3 }, 10, -5)).toEqual({ x: 11, y: -3, zoom: 3 });
  });

  it.each([
    [10, 3],
    [0.1, 0.5],
    [2, 2],
  ])('clamps zoom %d between 0.5 and 3 to %d', (zoom, expected) => {
    expect(clampZoom(zoom, 0.5, 3)).toBe(expected);
  });
});
