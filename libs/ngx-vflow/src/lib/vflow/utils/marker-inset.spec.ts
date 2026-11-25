import { insetPoint, markerInset, markerScale, markerSize, markerStrokeWidth, markerTipInset } from './marker-inset';

describe('markerInset', () => {
  it('should be zero without a marker', () => {
    expect(markerInset(undefined)).toBe(0);
  });

  describe('with declared shapes', () => {
    const shapes = new Map([['diamond', { template: null as never, inset: 10 }]]);

    it('is zero for a shape that is not declared', () => {
      expect(markerInset('diamond')).toBe(0);
    });

    it('takes the inset of a declared shape, scaled to the default marker size', () => {
      expect(markerInset('diamond', shapes)).toBe((10 * 16.5) / 20);
    });

    it('scales the inset of a declared shape with the marker width', () => {
      expect(markerInset({ type: 'diamond', width: 20 }, shapes)).toBe(10);
    });

    it('is zero for an unknown type', () => {
      expect(markerInset({ type: 'unknown', width: 20 }, shapes)).toBe(0);
    });
  });

  it('should end the path at the base of a closed arrow', () => {
    expect(markerTipInset({ type: 'arrow-closed' })).toBe(7);
  });

  it('should treat a marker without a type as a closed arrow', () => {
    expect(markerTipInset({})).toBe(7);
  });

  it('should scale the inset of a closed arrow to the marker size', () => {
    // 7 of 20 marker units, scaled to a marker of 20 flow units.
    expect(markerInset({ type: 'arrow-closed', width: 20 })).toBe(7);
  });

  it('should end the path just short of the tip of an open arrow', () => {
    expect(markerTipInset({ type: 'arrow' })).toBe(2);
  });

  it('should scale the inset of an open arrow to the marker size', () => {
    expect(markerInset({ type: 'arrow', width: 20 })).toBe(2);
  });

  it('should scale the inset with the marker width', () => {
    expect(markerInset({ type: 'arrow', width: 40 })).toBe(4);
    expect(markerInset({ type: 'arrow' })).toBeCloseTo(1.65);
  });

  it.each([
    ['2 by default', { width: 20 }, 2],
    ['halved at double size', { width: 40 }, 1],
    ['the given value', { width: 20, strokeWidth: 3 }, 3],
    ['the smaller side of a marker that is not square', { width: 40, height: 20 }, 2],
  ])('should stroke shapes strokeWidth flow units wide at any marker size: %s', (_, marker, width) => {
    expect(markerStrokeWidth(marker)).toBe(width);
  });

  it('should stroke the default marker 2 flow units wide', () => {
    expect(markerStrokeWidth({}) * 16.5).toBeCloseTo(40);
  });

  it('should let one side set both sides of a marker', () => {
    expect(markerSize({ width: 20 })).toEqual({ width: 20, height: 20 });
    expect(markerSize({ height: 30 })).toEqual({ width: 30, height: 30 });
  });

  it('should size a marker without sides by default', () => {
    expect(markerSize({})).toEqual({ width: 16.5, height: 16.5 });
  });

  it('should scale by the smaller side of a marker that is not square', () => {
    expect(markerScale({ width: 40, height: 20 })).toBe(1);
    expect(markerInset({ type: 'arrow', width: 40, height: 20 })).toBe(2);
  });

  it.each([
    ['left', { x: 7, y: 10 }],
    ['right', { x: 13, y: 10 }],
    ['top', { x: 10, y: 7 }],
    ['bottom', { x: 10, y: 13 }],
  ] as const)('should move a point away from its node along the %s handle side', (side, point) => {
    expect(insetPoint({ x: 10, y: 10 }, side, 3)).toEqual(point);
  });
});
