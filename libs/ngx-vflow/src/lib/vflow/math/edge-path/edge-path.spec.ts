import { getBezierPath } from './bezier-path';
import { getSmoothStepPath } from './smooth-step-path';
import { getStraightPath } from './straigh-path';

describe('edge path utilities', () => {
  it('builds a straight path with label positions along its direction', () => {
    const angle = (Math.atan2(50, 100) * 180) / Math.PI;

    expect(getStraightPath({ sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 100, y: 50 } })).toEqual({
      path: 'M 0,0L 100,50',
      bounds: { x: 0, y: 0, width: 100, height: 50 },
      labelPoints: {
        start: { x: 15, y: 7.5, angle },
        center: { x: 50, y: 25, angle },
        end: { x: 85, y: 42.5, angle },
      },
    });
  });

  it('gives bezier label points the direction of the curve', () => {
    const params = {
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 100, y: 100 },
      sourcePosition: 'right' as const,
      targetPosition: 'left' as const,
    };

    // Without curvature the control points sit on the endpoints and the curve is the diagonal.
    const flat = getBezierPath({ ...params, curvature: 0 }).labelPoints!;
    expect(flat.start.angle).toBeCloseTo(45);
    expect(flat.center.angle).toBeCloseTo(45);
    expect(flat.end.angle).toBeCloseTo(45);

    // The S-curve leaves and arrives flatter than its middle, symmetrically.
    const curved = getBezierPath(params).labelPoints!;
    expect(curved.start.angle).toBeCloseTo(curved.end.angle!);
    expect(curved.start.angle).toBeGreaterThan(0);
    expect(curved.center.angle).toBeGreaterThan(curved.start.angle!);
  });

  it('makes bezier curvature configurable', () => {
    const params = {
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 100, y: 100 },
      sourcePosition: 'right' as const,
      targetPosition: 'left' as const,
    };

    expect(getBezierPath({ ...params, curvature: 0 }).path).toBe('M0,0 C0,0 100,100 100,100');
    expect(getBezierPath({ ...params, curvature: 0.5 }).path).not.toBe(getBezierPath(params).path);
  });

  it('makes smooth-step offset configurable', () => {
    const params = {
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 100, y: 100 },
      sourcePosition: 'right' as const,
      targetPosition: 'left' as const,
    };

    expect(getSmoothStepPath({ ...params, offset: 40 }).path).not.toBe(getSmoothStepPath(params).path);
  });
});
