import { getSmoothStepPath } from './smooth-step-path';
import { CurveFactoryParams } from '../../interfaces/curve-factory.interface';
import { createEdge } from '../../interfaces/edge.interface';

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
    sourceNode: { id: 'source', x: 0, y: 150, width: 100, height: 100 },
    targetNode: { id: 'target', x: 400, y: 150, width: 100, height: 100 },
    allEdges: [],
    allNodes: [],
  });

  describe('path', () => {
    it('steps right, down and right with rounded corners between facing handles', () => {
      const result = getSmoothStepPath(createParams({ x: 100, y: 200 }, { x: 400, y: 500 }));

      expect(result.path).toBe('M100 200L120 200L 245,200Q 250,200 250,205L 250,495Q 250,500 255,500L380 500L400 500');
      expect(result.bounds).toEqual({ x: 100, y: 200, width: 300, height: 300 });
      expect(result.labelPoints).toEqual({
        start: { x: 190, y: 200, angle: 0 },
        center: { x: 250, y: 350, angle: 90 },
        end: { x: 310, y: 500, angle: 0 },
      });
    });

    it('draws sharp corners with a zero border radius', () => {
      const result = getSmoothStepPath({ ...createParams({ x: 100, y: 200 }, { x: 400, y: 500 }), borderRadius: 0 });

      expect(result.path).toBe('M100 200L120 200L 250,200Q 250,200 250,200L 250,500Q 250,500 250,500L380 500L400 500');
    });

    it('loops around both nodes when the target is behind the source', () => {
      const result = getSmoothStepPath(createParams({ x: 400, y: 200 }, { x: 100, y: 400 }));

      expect(result.path).toBe(
        'M400 200L 415,200Q 420,200 420,205L 420,295Q 420,300 415,300L 85,300Q 80,300 80,305L 80,395Q 80,400 85,400L100 400',
      );
      expect(result.bounds).toEqual({ x: 80, y: 200, width: 340, height: 200 });
      expect(result.labelPoints!.center).toEqual({ x: 250, y: 300, angle: 180 });
    });

    it('keeps the path and labels finite for coincident and nearly coincident handles', () => {
      for (const target of [
        { x: 200, y: 200 },
        { x: 201, y: 201 },
      ]) {
        const { path, labelPoints } = getSmoothStepPath(createParams({ x: 200, y: 200 }, target));
        const { start, center, end } = labelPoints!;

        expect(path).not.toContain('NaN');
        expect([start, center, end].flatMap(({ x, y }) => [x, y]).every(Number.isFinite)).toBe(true);
      }
    });
  });

  describe('label point angles', () => {
    it('should follow the segment of each label point', () => {
      // Right to left, target below: horizontal, vertical, horizontal.
      const { start, center, end } = getSmoothStepPath(
        createParams({ x: 100, y: 200 }, { x: 400, y: 500 }),
      ).labelPoints!;

      expect(start.angle).toBe(0);
      expect(center.angle).toBe(90);
      expect(end.angle).toBe(0);
    });

    it('should point down along a vertical edge', () => {
      const { start, center, end } = getSmoothStepPath(
        createParams({ x: 100, y: 100 }, { x: 100, y: 400 }, 'bottom', 'top'),
      ).labelPoints!;

      expect(start.angle).toBe(90);
      expect(center.angle).toBe(90);
      expect(end.angle).toBe(90);
    });

    it('should point left along an edge drawn backwards', () => {
      const { start, end } = getSmoothStepPath(
        createParams({ x: 400, y: 200 }, { x: 100, y: 200 }, 'left', 'right'),
      ).labelPoints!;

      expect(start.angle).toBe(180);
      expect(end.angle).toBe(180);
    });
  });

  describe('label order', () => {
    it('should position labels in correct order along horizontal path', () => {
      const sourcePoint = { x: 100, y: 200 };
      const targetPoint = { x: 400, y: 200 };
      const result = getSmoothStepPath(createParams(sourcePoint, targetPoint));

      const { start, center, end } = result.labelPoints!;

      // For left-to-right path, start should be leftmost, end should be rightmost
      expect(start.x).toBeLessThan(center.x);
      expect(center.x).toBeLessThan(end.x);
    });
  });
});
