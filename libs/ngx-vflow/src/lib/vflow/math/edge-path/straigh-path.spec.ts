import { getStraightPath } from './straigh-path';

describe('getStraightPath', () => {
  it('draws a line between the points', () => {
    expect(getStraightPath({ sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 100, y: 50 } }).path).toBe('M 0,0L 100,50');
  });

  it('bounds the line by its points', () => {
    expect(getStraightPath({ sourcePoint: { x: 100, y: 50 }, targetPoint: { x: 0, y: 0 } }).bounds).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });
  });

  it('puts the label points at 15%, 50% and 85% of the line', () => {
    const { labelPoints } = getStraightPath({ sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 100, y: 50 } });

    expect(labelPoints?.start).toMatchObject({ x: 15, y: 7.5 });
    expect(labelPoints?.center).toMatchObject({ x: 50, y: 25 });
    expect(labelPoints?.end).toMatchObject({ x: 85, y: 42.5 });
  });

  it('gives every label point the direction of the line', () => {
    const { labelPoints } = getStraightPath({ sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 100, y: 100 } });

    expect([labelPoints?.start?.angle, labelPoints?.center?.angle, labelPoints?.end?.angle]).toEqual([45, 45, 45]);
  });

  it('points the label points backwards for a line drawn to the left', () => {
    const { labelPoints } = getStraightPath({ sourcePoint: { x: 100, y: 0 }, targetPoint: { x: 0, y: 0 } });

    expect(labelPoints?.center).toEqual({ x: 50, y: 0, angle: 180 });
  });

  it('keeps coincident points finite', () => {
    const { path, labelPoints } = getStraightPath({ sourcePoint: { x: 7, y: 7 }, targetPoint: { x: 7, y: 7 } });

    expect(path).toBe('M 7,7L 7,7');
    expect(labelPoints?.center).toEqual({ x: 7, y: 7, angle: 0 });
  });
});
