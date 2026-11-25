import { directionAngle } from './direction-angle';

describe('directionAngle', () => {
  it.each([
    ['right', { x: 10, y: 0 }, 0],
    ['down', { x: 0, y: 10 }, 90],
    ['left', { x: -10, y: 0 }, 180],
    ['up', { x: 0, y: -10 }, -90],
    ['down and right', { x: 10, y: 10 }, 45],
    ['up and left', { x: -10, y: -10 }, -135],
  ])('is measured clockwise from the right when pointing %s', (_, to, angle) => {
    expect(directionAngle({ x: 0, y: 0 }, to)).toBe(angle);
  });

  it('depends on the difference of the points, not on where they are', () => {
    expect(directionAngle({ x: 100, y: 200 }, { x: 110, y: 210 })).toBe(45);
  });

  it('is zero for coincident points', () => {
    expect(directionAngle({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });
});
