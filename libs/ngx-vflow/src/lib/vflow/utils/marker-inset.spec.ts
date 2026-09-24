import { insetPoint, markerInset, markerTipInset } from './marker-inset';

describe('markerInset', () => {
  it('should be zero without a marker', () => {
    expect(markerInset(undefined)).toBe(0);
  });

  it('should end the path at the base of a closed arrow', () => {
    expect(markerTipInset({ type: 'arrow-closed' })).toBe(7);
    expect(markerTipInset({})).toBe(7);
    // 7 of 20 marker units, scaled to a marker of 20 flow units.
    expect(markerInset({ type: 'arrow-closed', width: 20 })).toBe(7);
  });

  it('should end the path just short of the tip of an open arrow', () => {
    expect(markerTipInset({ type: 'arrow' })).toBe(2);
    expect(markerInset({ type: 'arrow', width: 20 })).toBe(2);
  });

  it('should scale the inset with the marker width', () => {
    expect(markerInset({ type: 'arrow', width: 40 })).toBe(4);
    expect(markerInset({ type: 'arrow' })).toBeCloseTo(1.65);
  });

  it('should move a point away from its node along the handle side', () => {
    expect(insetPoint({ x: 10, y: 10 }, 'left', 3)).toEqual({ x: 7, y: 10 });
    expect(insetPoint({ x: 10, y: 10 }, 'right', 3)).toEqual({ x: 13, y: 10 });
    expect(insetPoint({ x: 10, y: 10 }, 'top', 3)).toEqual({ x: 10, y: 7 });
    expect(insetPoint({ x: 10, y: 10 }, 'bottom', 3)).toEqual({ x: 10, y: 13 });
  });
});
