import { BezierPathParams } from '../../interfaces/curve-factory.interface';
import { getBezierPath } from './bezier-path';

describe('getBezierPath', () => {
  const horizontal: BezierPathParams = {
    sourcePoint: { x: 0, y: 0 },
    targetPoint: { x: 100, y: 100 },
    sourcePosition: 'right',
    targetPosition: 'left',
  };

  describe('control points', () => {
    it('leave the source in the direction of its handle side', () => {
      expect(getBezierPath(horizontal).path).toBe('M0,0 C62.5,0 37.5,100 100,100');
    });

    it.each<[string, BezierPathParams, string]>([
      [
        'top and bottom',
        { ...horizontal, targetPoint: { x: 0, y: 100 }, sourcePosition: 'bottom', targetPosition: 'top' },
        'M0,0 C0,62.5 0,37.5 0,100',
      ],
      [
        'bottom and top, drawn upwards',
        {
          ...horizontal,
          sourcePoint: { x: 0, y: 100 },
          targetPoint: { x: 0, y: 0 },
          sourcePosition: 'top',
          targetPosition: 'bottom',
        },
        'M0,100 C0,37.5 0,62.5 0,0',
      ],
      [
        'left and right, drawn to the left',
        {
          ...horizontal,
          sourcePoint: { x: 100, y: 0 },
          targetPoint: { x: 0, y: 0 },
          sourcePosition: 'left',
          targetPosition: 'right',
        },
        'M100,0 C37.5,0 62.5,0 0,0',
      ],
    ])('follow the sides %s', (_, params, path) => {
      expect(getBezierPath(params).path).toBe(path);
    });

    it('grow with the curvature', () => {
      expect(getBezierPath({ ...horizontal, curvature: 0.5 }).path).toBe('M0,0 C125,0 -25,100 100,100');
    });

    it('lie on the endpoints without curvature', () => {
      expect(getBezierPath({ ...horizontal, curvature: 0 }).path).toBe('M0,0 C0,0 100,100 100,100');
    });
  });

  describe('bounds', () => {
    it('include the control points', () => {
      expect(getBezierPath(horizontal).bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
      expect(getBezierPath({ ...horizontal, curvature: 0.5 }).bounds).toEqual({
        x: -25,
        y: 0,
        width: 150,
        height: 100,
      });
    });
  });

  describe('label points', () => {
    it('lie on the curve at 10%, 50% and 90%, in order from the source', () => {
      const { start, center, end } = getBezierPath(horizontal).labelPoints!;

      expect(center).toMatchObject({ x: 50, y: 50 });
      expect(start!.x).toBeLessThan(center!.x);
      expect(center!.x).toBeLessThan(end!.x);
      expect(start!.y).toBeLessThan(center!.y);
      expect(center!.y).toBeLessThan(end!.y);
    });

    it('follow the direction of the curve, which is flatter at the ends than in the middle', () => {
      const { start, center, end } = getBezierPath(horizontal).labelPoints!;

      expect(start!.angle).toBeCloseTo(end!.angle!);
      expect(start!.angle).toBeGreaterThan(0);
      expect(center!.angle).toBeGreaterThan(start!.angle!);
    });

    it('follow the diagonal when the curvature is zero', () => {
      const { start, center, end } = getBezierPath({ ...horizontal, curvature: 0 }).labelPoints!;

      expect([start!.angle, center!.angle, end!.angle].map((angle) => Math.round(angle! * 1000) / 1000)).toEqual([
        45, 45, 45,
      ]);
    });

    it.each([
      ['down', { ...horizontal, targetPoint: { x: 0, y: 100 }, sourcePosition: 'bottom', targetPosition: 'top' }, 90],
      [
        'up',
        {
          ...horizontal,
          sourcePoint: { x: 0, y: 100 },
          targetPoint: { x: 0, y: 0 },
          sourcePosition: 'top',
          targetPosition: 'bottom',
        },
        -90,
      ],
      [
        'left',
        {
          ...horizontal,
          sourcePoint: { x: 100, y: 0 },
          targetPoint: { x: 0, y: 0 },
          sourcePosition: 'left',
          targetPosition: 'right',
        },
        180,
      ],
    ] as [string, BezierPathParams, number][])(
      'point %s along a straight curve in that direction',
      (_, params, angle) => {
        expect(getBezierPath(params).labelPoints!.center!.angle).toBeCloseTo(angle);
      },
    );
  });
});
