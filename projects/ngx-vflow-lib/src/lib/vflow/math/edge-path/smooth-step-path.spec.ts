import { smoothStepPath } from './smooth-step-path';
import { CurveFactoryParams } from '../../interfaces/curve-factory.interface';

describe('smoothStepPath', () => {
  const createParams = (
    sourcePoint = { x: 100, y: 200 },
    targetPoint = { x: 400, y: 200 },
    sourcePosition: 'top' | 'bottom' | 'left' | 'right' = 'right',
    targetPosition: 'top' | 'bottom' | 'left' | 'right' = 'left',
  ): CurveFactoryParams => ({
    mode: 'edge',
    edge: {
      id: 'test-edge',
      source: 'source',
      target: 'target',
    },
    sourcePoint,
    targetPoint,
    sourcePosition,
    targetPosition,
    allEdges: [],
    allNodes: [],
  });

  describe('basic functionality', () => {
    it('should create a valid SVG path', () => {
      const result = smoothStepPath(createParams());

      expect(result.path).toBeDefined();
      expect(result.path).toMatch(/^M\d+/); // Should start with M (move to)
      expect(result.path.length).toBeGreaterThan(10);
    });

    it('should return label points for start, center, and end', () => {
      const result = smoothStepPath(createParams());

      expect(result.labelPoints).toBeDefined();
      const labelPoints = result.labelPoints!;

      expect(labelPoints.start).toBeDefined();
      expect(labelPoints.center).toBeDefined();
      expect(labelPoints.end).toBeDefined();

      // All label points should have x and y coordinates
      expect(typeof labelPoints.start.x).toBe('number');
      expect(typeof labelPoints.start.y).toBe('number');
      expect(typeof labelPoints.center.x).toBe('number');
      expect(typeof labelPoints.center.y).toBe('number');
      expect(typeof labelPoints.end.x).toBe('number');
      expect(typeof labelPoints.end.y).toBe('number');
    });
  });

  describe('label positioning fix', () => {
    it('should position start and end labels at different points along the path', () => {
      const result = smoothStepPath(createParams());

      const { start, center, end } = result.labelPoints!;

      // Start, center, and end labels should be at different positions
      expect(start.x).not.toBe(center.x);
      expect(end.x).not.toBe(center.x);
      expect(start.x).not.toBe(end.x);
    });

    it('should position start label closer to source than target', () => {
      const sourcePoint = { x: 100, y: 200 };
      const targetPoint = { x: 400, y: 200 };
      const result = smoothStepPath(createParams(sourcePoint, targetPoint));

      const { start } = result.labelPoints!;
      const distanceToSource = Math.abs(start.x - sourcePoint.x);
      const distanceToTarget = Math.abs(start.x - targetPoint.x);

      expect(distanceToSource).toBeLessThan(distanceToTarget);
    });

    it('should position end label closer to target than source', () => {
      const sourcePoint = { x: 100, y: 200 };
      const targetPoint = { x: 400, y: 200 };
      const result = smoothStepPath(createParams(sourcePoint, targetPoint));

      const { end } = result.labelPoints!;
      const distanceToSource = Math.abs(end.x - sourcePoint.x);
      const distanceToTarget = Math.abs(end.x - targetPoint.x);

      expect(distanceToTarget).toBeLessThan(distanceToSource);
    });

    it('should position labels in correct order along horizontal path', () => {
      const sourcePoint = { x: 100, y: 200 };
      const targetPoint = { x: 400, y: 200 };
      const result = smoothStepPath(createParams(sourcePoint, targetPoint));

      const { start, center, end } = result.labelPoints!;

      // For left-to-right path, start should be leftmost, end should be rightmost
      expect(start.x).toBeLessThan(center.x);
      expect(center.x).toBeLessThan(end.x);
    });

    it('should handle vertical paths correctly', () => {
      const sourcePoint = { x: 200, y: 100 };
      const targetPoint = { x: 200, y: 400 };
      const params = createParams(sourcePoint, targetPoint, 'bottom', 'top');
      const result = smoothStepPath(params);

      const { start, center, end } = result.labelPoints!;

      // All labels should have valid coordinates
      expect(start.x).toBeDefined();
      expect(start.y).toBeDefined();
      expect(center.x).toBeDefined();
      expect(center.y).toBeDefined();
      expect(end.x).toBeDefined();
      expect(end.y).toBeDefined();

      // Start and end should be at different positions
      expect(start.x !== center.x || start.y !== center.y).toBe(true);
      expect(end.x !== center.x || end.y !== center.y).toBe(true);
    });
  });

  describe('border radius parameter', () => {
    it('should handle different border radius values', () => {
      const params = createParams();

      const result0 = smoothStepPath(params, 0);
      const result5 = smoothStepPath(params, 5);
      const result10 = smoothStepPath(params, 10);

      // All should produce valid paths
      expect(result0.path).toBeDefined();
      expect(result5.path).toBeDefined();
      expect(result10.path).toBeDefined();

      // All should have properly positioned labels
      expect(result0.labelPoints!.start.x).not.toBe(result0.labelPoints!.end.x);
      expect(result5.labelPoints!.start.x).not.toBe(result5.labelPoints!.end.x);
      expect(result10.labelPoints!.start.x).not.toBe(result10.labelPoints!.end.x);
    });
  });

  describe('edge cases', () => {
    it('should handle same source and target positions', () => {
      const point = { x: 200, y: 200 };
      const result = smoothStepPath(createParams(point, point));

      expect(result.path).toBeDefined();
      expect(result.labelPoints!.start).toBeDefined();
      expect(result.labelPoints!.center).toBeDefined();
      expect(result.labelPoints!.end).toBeDefined();
    });

    it('should handle very close points', () => {
      const sourcePoint = { x: 200, y: 200 };
      const targetPoint = { x: 201, y: 201 };
      const result = smoothStepPath(createParams(sourcePoint, targetPoint));

      expect(result.path).toBeDefined();
      expect(result.labelPoints!.start).toBeDefined();
      expect(result.labelPoints!.center).toBeDefined();
      expect(result.labelPoints!.end).toBeDefined();
    });

    it('should handle very distant points', () => {
      const sourcePoint = { x: 0, y: 0 };
      const targetPoint = { x: 1000, y: 1000 };
      const result = smoothStepPath(createParams(sourcePoint, targetPoint));

      expect(result.path).toBeDefined();
      expect(result.labelPoints!.start).toBeDefined();
      expect(result.labelPoints!.center).toBeDefined();
      expect(result.labelPoints!.end).toBeDefined();

      // Labels should still be positioned correctly
      const { start, end } = result.labelPoints!;
      const distanceStartToSource = Math.abs(start.x - sourcePoint.x) + Math.abs(start.y - sourcePoint.y);
      const distanceEndToTarget = Math.abs(end.x - targetPoint.x) + Math.abs(end.y - targetPoint.y);
      const distanceStartToTarget = Math.abs(start.x - targetPoint.x) + Math.abs(start.y - targetPoint.y);
      const distanceEndToSource = Math.abs(end.x - sourcePoint.x) + Math.abs(end.y - sourcePoint.y);

      expect(distanceStartToSource).toBeLessThan(distanceStartToTarget);
      expect(distanceEndToTarget).toBeLessThan(distanceEndToSource);
    });
  });
});
