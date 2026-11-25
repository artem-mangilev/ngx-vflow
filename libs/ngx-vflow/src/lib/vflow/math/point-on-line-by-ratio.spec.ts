import { getPointOnLineByRatio } from './point-on-line-by-ratio';

describe('getPointOnLineByRatio', () => {
  const start = { x: 10, y: 20 };
  const end = { x: 110, y: 70 };

  it.each([
    [0, { x: 10, y: 20 }],
    [0.25, { x: 35, y: 32.5 }],
    [0.5, { x: 60, y: 45 }],
    [1, { x: 110, y: 70 }],
  ])('is the point at ratio %s of the way from the start to the end', (ratio, point) => {
    expect(getPointOnLineByRatio(start, end, ratio)).toEqual(point);
  });

  it.each([
    [-0.5, { x: -40, y: -5 }],
    [1.5, { x: 160, y: 95 }],
  ])('continues the line for the ratio %s outside the segment', (ratio, point) => {
    expect(getPointOnLineByRatio(start, end, ratio)).toEqual(point);
  });

  it('is the point itself when the ends coincide', () => {
    expect(getPointOnLineByRatio(start, start, 0.3)).toEqual(start);
  });
});
