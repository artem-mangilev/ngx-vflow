import { getFloatingEdgeParams } from './floating-edge-params';

describe('getFloatingEdgeParams', () => {
  const source = { x: 0, y: 0, width: 100, height: 50 };

  it('crosses the vertical border towards a node beside the source', () => {
    const params = getFloatingEdgeParams(source, { x: 300, y: 25, width: 100, height: 50 });

    expect(params.sourcePoint.x).toBe(100);
    expect(params.sourcePoint.y).toBeCloseTo(25 + (25 * 50) / 300, 10);
    expect(params.sourcePosition).toBe('right');
    expect(params.targetPoint.x).toBe(300);
    expect(params.targetPoint.y).toBeCloseTo(50 - (25 * 50) / 300, 10);
    expect(params.targetPosition).toBe('left');
  });

  it('crosses the horizontal border towards a node above the source', () => {
    const params = getFloatingEdgeParams(source, { x: 10, y: -200, width: 80, height: 40 });

    expect(params.sourcePosition).toBe('top');
    expect(params.sourcePoint.y).toBe(0);
    expect(params.targetPosition).toBe('bottom');
    expect(params.targetPoint.y).toBe(-160);
  });

  it('treats a rectangle without size as a point and applies the marker inset along the side', () => {
    const pointer = { x: 250, y: 25, width: 0, height: 0 };
    const params = getFloatingEdgeParams(source, pointer, { inset: { start: 3, end: 5 } });

    expect(params.sourcePoint).toEqual({ x: 103, y: 25 });
    // The pointer is reached from its left, so the path stops before it and the arrow tip lands on it.
    expect(params.targetPoint).toEqual({ x: 245, y: 25 });
    expect(params.targetPosition).toBe('left');
  });

  it('falls back to the center and the top side for coincident centers', () => {
    const params = getFloatingEdgeParams(source, { x: 25, y: 0, width: 50, height: 50 });

    expect(params.sourcePoint).toEqual({ x: 50, y: 25 });
    expect(params.sourcePosition).toBe('top');
  });
});
