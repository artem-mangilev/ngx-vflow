import { CurveFactory, CurveFactoryParams } from '../../interfaces/curve-factory.interface';
import { createEdge } from '../../interfaces/edge.interface';
import { getBezierPath } from './bezier-path';
import { resolveCurve } from './resolve-curve';
import { getSmoothStepPath } from './smooth-step-path';
import { getStraightPath } from './straigh-path';

describe('resolveCurve', () => {
  const params: CurveFactoryParams = {
    mode: 'edge',
    edge: createEdge({ id: 'edge', source: 'a', target: 'b' }),
    sourcePoint: { x: 0, y: 0 },
    targetPoint: { x: 100, y: 100 },
    sourcePosition: 'right',
    targetPosition: 'left',
    markerInset: { start: 0, end: 0 },
    sourceNode: { id: 'a', parentId: null, x: -100, y: -25, width: 100, height: 50 },
    targetNode: { id: 'b', parentId: null, x: 100, y: 75, width: 100, height: 50 },
    allEdges: [],
    allNodes: [],
    nodeGeometries: [],
  };

  it('lays out the straight curve', () => {
    expect(resolveCurve('straight', params)).toEqual(getStraightPath(params));
  });

  it('lays out the bezier curve', () => {
    expect(resolveCurve('bezier', params)).toEqual(getBezierPath(params));
  });

  it('lays out the smooth-step curve with rounded corners', () => {
    expect(resolveCurve('smooth-step', params)).toEqual(getSmoothStepPath(params));
  });

  it('lays out the step curve as a smooth-step curve with sharp corners', () => {
    expect(resolveCurve('step', params)).toEqual(getSmoothStepPath({ ...params, borderRadius: 0 }));
    expect(resolveCurve('step', params)).not.toEqual(resolveCurve('smooth-step', params));
  });

  it('calls a factory with the full parameters and returns its layout', () => {
    const layout = { path: 'M0,0' };
    const factory: CurveFactory = vi.fn(() => layout);

    expect(resolveCurve(factory, params)).toBe(layout);
    expect(factory).toHaveBeenCalledWith(params);
  });

  it.each(['straight', 'bezier', 'smooth-step', 'step'] as const)(
    'does not read the node geometries for the %s curve',
    (curve) => {
      const lazy = {
        ...params,
        get nodeGeometries(): never {
          throw new Error('nodeGeometries was read');
        },
      } as CurveFactoryParams;

      expect(() => resolveCurve(curve, lazy)).not.toThrow();
    },
  );
});
