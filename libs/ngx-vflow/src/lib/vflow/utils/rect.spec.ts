import {
  getBoundsOfPoints,
  getBoundsOfRects,
  getOverlappingArea,
  isPointInRect,
  rectContains,
  rectsIntersect,
} from './rect';

const rect = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

describe('rectsIntersect', () => {
  const base = rect(0, 0, 100, 50);

  it.each([
    ['overlap', rect(50, 25, 100, 50)],
    ['one inside the other', rect(10, 10, 5, 5)],
    ['touch at a side', rect(100, 0, 10, 10)],
    ['touch at a corner', rect(100, 50, 10, 10)],
  ])('is true for rects that %s', (_, other) => {
    expect(rectsIntersect(base, other)).toBe(true);
  });

  it.each([
    ['right', rect(101, 0, 10, 10)],
    ['left', rect(-11, 0, 10, 10)],
    ['below', rect(0, 51, 10, 10)],
    ['above', rect(0, -11, 10, 10)],
  ])('is false for a rect apart on the %s', (_, other) => {
    expect(rectsIntersect(base, other)).toBe(false);
  });
});

describe('getOverlappingArea', () => {
  it('is the area of the common part', () => {
    expect(getOverlappingArea(rect(0, 0, 100, 50), rect(50, 25, 100, 50))).toBe(50 * 25);
  });

  it('is the area of the inner rect when it lies inside', () => {
    expect(getOverlappingArea(rect(0, 0, 100, 100), rect(10, 10, 20, 30))).toBe(600);
  });

  it.each([
    ['apart', rect(200, 0, 10, 10)],
    ['touching', rect(100, 0, 10, 10)],
  ])('is zero for rects %s', (_, other) => {
    expect(getOverlappingArea(rect(0, 0, 100, 50), other)).toBe(0);
  });

  it('rounds a fractional area up', () => {
    expect(getOverlappingArea(rect(0, 0, 10, 10), rect(9.5, 9.5, 10, 10))).toBe(1);
  });
});

describe('rectContains', () => {
  const outer = rect(0, 0, 100, 100);

  it.each([
    ['inside', rect(10, 10, 20, 20)],
    ['equal', rect(0, 0, 100, 100)],
  ])('is true for a rect %s', (_, inner) => {
    expect(rectContains(inner, outer)).toBe(true);
  });

  it.each([
    ['left', rect(-1, 10, 20, 20)],
    ['top', rect(10, -1, 20, 20)],
    ['right', rect(90, 10, 20, 20)],
    ['bottom', rect(10, 90, 20, 20)],
  ])('is false for a rect that sticks out at the %s', (_, inner) => {
    expect(rectContains(inner, outer)).toBe(false);
  });

  it('is false when the outer rect is the inner one', () => {
    expect(rectContains(outer, rect(10, 10, 20, 20))).toBe(false);
  });
});

describe('isPointInRect', () => {
  const area = rect(10, 20, 100, 50);

  it.each([
    ['inside', { x: 50, y: 40 }],
    ['on the top-left corner', { x: 10, y: 20 }],
    ['on the bottom-right corner', { x: 110, y: 70 }],
  ])('is true for a point %s', (_, point) => {
    expect(isPointInRect(point, area)).toBe(true);
  });

  it.each([
    ['left', { x: 9, y: 40 }],
    ['right', { x: 111, y: 40 }],
    ['above', { x: 50, y: 19 }],
    ['below', { x: 50, y: 71 }],
  ])('is false for a point %s of it', (_, point) => {
    expect(isPointInRect(point, area)).toBe(false);
  });
});

describe('getBoundsOfRects', () => {
  it('is an empty rect at the origin without rects', () => {
    expect(getBoundsOfRects([])).toEqual(rect(0, 0, 0, 0));
  });

  it('is the rect itself for one rect', () => {
    expect(getBoundsOfRects([rect(5, 6, 7, 8)])).toEqual(rect(5, 6, 7, 8));
  });

  it('is the smallest rect around all rects, also at negative coordinates', () => {
    expect(getBoundsOfRects([rect(-50, -20, 10, 10), rect(100, 30, 20, 40), rect(0, 0, 5, 5)])).toEqual(
      rect(-50, -20, 170, 90),
    );
  });
});

describe('getBoundsOfPoints', () => {
  it('is the smallest rect around the points', () => {
    expect(
      getBoundsOfPoints([
        { x: 10, y: 50 },
        { x: -10, y: 20 },
        { x: 30, y: 0 },
      ]),
    ).toEqual(rect(-10, 0, 40, 50));
  });

  it('has no size for one point', () => {
    expect(getBoundsOfPoints([{ x: 3, y: 4 }])).toEqual(rect(3, 4, 0, 0));
  });

  it('is empty without points', () => {
    expect(getBoundsOfPoints([])).toEqual(rect(0, 0, 0, 0));
  });
});
