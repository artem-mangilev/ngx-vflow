import { getBezierPath } from './bezier-path';
import { getSmoothStepPath } from './smooth-step-path';
import { getStraightPath } from './straigh-path';

describe('edge path utilities', () => {
  it('builds a straight path with label positions', () => {
    expect(getStraightPath({ sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 100, y: 50 } })).toEqual({
      path: 'M 0,0L 100,50',
      labelPoints: {
        start: { x: 15, y: 7.5 },
        center: { x: 50, y: 25 },
        end: { x: 85, y: 42.5 },
      },
    });
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
