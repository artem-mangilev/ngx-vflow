import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';

export interface RectSides {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface RectSize {
  width: number;
  height: number;
}

export function rectToSides(rect: Rect): RectSides {
  return {
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height,
  };
}

export function rectsIntersect(rectA: Rect, rectB: Rect): boolean {
  return !(
    rectA.x + rectA.width < rectB.x ||
    rectA.x > rectB.x + rectB.width ||
    rectA.y + rectA.height < rectB.y ||
    rectA.y > rectB.y + rectB.height
  );
}

export function getOverlappingArea(rectA: Rect, rectB: Rect): number {
  const xOverlap = Math.max(0, Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x));
  const yOverlap = Math.max(0, Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y));

  return Math.ceil(xOverlap * yOverlap);
}

export function rectContains(inner: Rect, outer: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

export function isPointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export function getBoundsOfRects(rects: Rect[]): Rect {
  if (rects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rects.forEach((rect) => {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
