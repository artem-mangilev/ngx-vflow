export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectWithSides extends Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function rectToRectWithSides(rect: Rect): RectWithSides {
  return {
    ...rect,
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height,
  };
}
