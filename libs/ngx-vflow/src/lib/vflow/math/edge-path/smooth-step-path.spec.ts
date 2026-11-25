import { getEdgeCenter, getSmoothStepPath } from './smooth-step-path';
import { CurveFactoryParams, CurveLayout } from '../../interfaces/curve-factory.interface';
import { EdgeLabelPoint, EdgeLabelPosition } from '../../interfaces/edge-label.interface';
import { createEdge } from '../../interfaces/edge.interface';
import { Position } from '../../types/position.type';

/** The three label points of a layout, which the smooth step path always provides. */
function labelPointsOf(labelPoints: CurveLayout['labelPoints']): Record<EdgeLabelPosition, EdgeLabelPoint> {
  const { start, center, end } = labelPoints ?? {};
  if (!start || !center || !end) throw new Error('label points missing');
  return { start, center, end };
}

describe('getSmoothStepPath', () => {
  const createParams = (
    sourcePoint = { x: 100, y: 200 },
    targetPoint = { x: 400, y: 200 },
    sourcePosition: 'top' | 'bottom' | 'left' | 'right' = 'right',
    targetPosition: 'top' | 'bottom' | 'left' | 'right' = 'left',
  ): CurveFactoryParams => ({
    mode: 'edge',
    edge: createEdge({
      id: 'test-edge',
      source: 'source',
      target: 'target',
    }),
    sourcePoint,
    targetPoint,
    sourcePosition,
    targetPosition,
    markerInset: { start: 0, end: 0 },
    sourceNode: { id: 'source', parentId: null, x: 0, y: 150, width: 100, height: 100 },
    targetNode: { id: 'target', parentId: null, x: 400, y: 150, width: 100, height: 100 },
    allEdges: [],
    allNodes: [],
    nodeGeometries: [],
  });

  describe('path', () => {
    it('steps right, down and right with rounded corners between facing handles', () => {
      const result = getSmoothStepPath(createParams({ x: 100, y: 200 }, { x: 400, y: 500 }));

      expect(result.path).toBe('M100 200L120 200L 245,200Q 250,200 250,205L 250,495Q 250,500 255,500L380 500L400 500');
      expect(result.bounds).toEqual({ x: 100, y: 200, width: 300, height: 300 });
    });

    it('draws sharp corners with a zero border radius', () => {
      const result = getSmoothStepPath({ ...createParams({ x: 100, y: 200 }, { x: 400, y: 500 }), borderRadius: 0 });

      expect(result.path).toBe('M100 200L120 200L 250,200Q 250,200 250,200L 250,500Q 250,500 250,500L380 500L400 500');
    });

    it('limits a corner to half of its shorter segment', () => {
      const result = getSmoothStepPath({
        ...createParams({ x: 0, y: 0 }, { x: 100, y: 4 }),
        sourcePosition: 'right',
        targetPosition: 'left',
      });

      expect(result.path).toBe('M0 0L20 0L 48,0Q 50,0 50,2L 50,2Q 50,4 52,4L80 4L100 4');
    });

    it('draws no corner between handles on one line', () => {
      const result = getSmoothStepPath(createParams({ x: 100, y: 200 }, { x: 400, y: 200 }));

      expect(result.path).toMatch(/^M100 200(L[\d.]+ 200)+$/);
      expect(result.bounds).toEqual({ x: 100, y: 200, width: 300, height: 0 });
    });

    it('moves the first bend away from the handle by the offset', () => {
      const result = getSmoothStepPath({ ...createParams({ x: 100, y: 200 }, { x: 400, y: 500 }), offset: 40 });

      expect(result.path).toBe('M100 200L140 200L 245,200Q 250,200 250,205L 250,495Q 250,500 255,500L360 500L400 500');
    });

    it('loops around both nodes when the target is behind the source', () => {
      const result = getSmoothStepPath(createParams({ x: 400, y: 200 }, { x: 100, y: 400 }));

      expect(result.path).toBe(
        'M400 200L 415,200Q 420,200 420,205L 420,295Q 420,300 415,300L 85,300Q 80,300 80,305L 80,395Q 80,400 85,400L100 400',
      );
      expect(result.bounds).toEqual({ x: 80, y: 200, width: 340, height: 200 });
    });

    // Mixed sides: each case lists the corners of the path, with the gap points that leave and enter the handles.
    it.each<[string, Position, Position, [number, number], [number, number], string]>([
      [
        'right to bottom with the target below',
        'right',
        'bottom',
        [100, 100],
        [300, 300],
        'M100 100L 120,100Q 120,100 120,100L 120,320Q 120,320 120,320L 300,320Q 300,320 300,320L300 300',
      ],
      [
        'right to bottom with the target above',
        'right',
        'bottom',
        [100, 300],
        [300, 100],
        'M100 300L120 300L 300,300Q 300,300 300,300L300 120L300 100',
      ],
      [
        'bottom to top',
        'bottom',
        'top',
        [100, 100],
        [300, 300],
        'M100 100L100 120L 100,200Q 100,200 100,200L 300,200Q 300,200 300,200L300 280L300 300',
      ],
      [
        'top to bottom, drawn upwards',
        'top',
        'bottom',
        [100, 300],
        [300, 100],
        'M100 300L100 280L 100,200Q 100,200 100,200L 300,200Q 300,200 300,200L300 120L300 100',
      ],
    ])('routes %s', (_, sourcePosition, targetPosition, [sx, sy], [tx, ty], path) => {
      const params = createParams({ x: sx, y: sy }, { x: tx, y: ty }, sourcePosition, targetPosition);

      expect(getSmoothStepPath({ ...params, borderRadius: 0 }).path).toBe(path);
    });

    it('goes around the handles of the same side when they are far apart', () => {
      const params = createParams({ x: 100, y: 100 }, { x: 400, y: 300 }, 'right', 'right');

      expect(getSmoothStepPath({ ...params, borderRadius: 0 }).path).toBe(
        'M100 100L120 100L 420,100Q 420,100 420,100L 420,300Q 420,300 420,300L400 300',
      );
    });

    it('pulls the gap points of same-side handles closer than the offset together so they do not overlap', () => {
      const params = createParams({ x: 100, y: 100 }, { x: 110, y: 300 }, 'right', 'right');

      expect(getSmoothStepPath({ ...params, borderRadius: 0 }).path).toBe(
        'M100 100L110 100L 130,100Q 130,100 130,100L 130,300Q 130,300 130,300L110 300',
      );
    });

    it.each([
      ['on top of each other', { x: 200, y: 200 }],
      ['one unit apart', { x: 201, y: 201 }],
    ])('keeps the path and labels finite for handles %s', (_, target) => {
      const { path, labelPoints } = getSmoothStepPath(createParams({ x: 200, y: 200 }, target));
      const { start, center, end } = labelPointsOf(labelPoints);

      expect(path).not.toContain('NaN');
      expect([start, center, end].flatMap(({ x, y }) => [x, y]).every(Number.isFinite)).toBe(true);
    });
  });

  describe('label points', () => {
    it('lie on the first, middle and last segments of a path with two corners', () => {
      const { labelPoints } = getSmoothStepPath(createParams({ x: 100, y: 200 }, { x: 400, y: 500 }));

      expect(labelPoints).toEqual({
        start: { x: 190, y: 200, angle: 0 },
        center: { x: 250, y: 350, angle: 90 },
        end: { x: 310, y: 500, angle: 0 },
      });
    });

    it('put the center on the longest segment of a path between same-side handles', () => {
      const params = createParams({ x: 100, y: 100 }, { x: 400, y: 300 }, 'right', 'right');

      expect(getSmoothStepPath(params).labelPoints!.center).toEqual({ x: 270, y: 100, angle: 0 });
    });

    it('point down along a vertical edge', () => {
      const { start, center, end } = labelPointsOf(
        getSmoothStepPath(createParams({ x: 100, y: 100 }, { x: 100, y: 400 }, 'bottom', 'top')).labelPoints,
      );

      expect([start.angle, center.angle, end.angle]).toEqual([90, 90, 90]);
    });

    it('point left along an edge drawn backwards', () => {
      const { start, end } = labelPointsOf(
        getSmoothStepPath(createParams({ x: 400, y: 200 }, { x: 100, y: 200 }, 'left', 'right')).labelPoints,
      );

      expect([start.angle, end.angle]).toEqual([180, 180]);
    });

    it('run from the source to the target along a horizontal edge', () => {
      const { start, center, end } = labelPointsOf(
        getSmoothStepPath(createParams({ x: 100, y: 200 }, { x: 400, y: 200 })).labelPoints,
      );

      expect(start.x).toBeLessThan(center.x);
      expect(center.x).toBeLessThan(end.x);
    });
  });
});

describe('getEdgeCenter', () => {
  it('is the middle between the points with the half distances', () => {
    expect(getEdgeCenter({ x: 0, y: 0 }, { x: 100, y: 50 })).toEqual([50, 25, 50, 25]);
  });

  it('does not depend on the order of the points', () => {
    expect(getEdgeCenter({ x: 100, y: 50 }, { x: 0, y: 0 })).toEqual([50, 25, 50, 25]);
  });
});
