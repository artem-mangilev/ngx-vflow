import { signal } from '@angular/core';
import { NodeModel } from '../../models/node.model';
import { Point } from '../../interfaces/point.interface';
import { startResize } from './resizer';

/** The part of a node model a resize reads and writes. */
function node(width: number, height: number) {
  const size = { width: signal(width), height: signal(height) };
  const point = signal<Point>({ x: 0, y: 0 });
  return {
    rawNode: { id: 'node' },
    point,
    ...size,
    resizing: signal(false),
    parent: () => null,
    extent: () => null,
    children: () => [],
    setPoint: (next: Point) => point.set(next),
    setExplicitSize({ width, height }: { width?: number; height?: number }) {
      if (width !== undefined) size.width.set(width);
      if (height !== undefined) size.height.set(height);
    },
  } as unknown as NodeModel;
}

describe('startResize', () => {
  for (const [width, height] of [
    [0, 0],
    [50, 0],
    [0, 50],
  ]) {
    it(`keeps the aspect ratio of a ${width}×${height} node without writing NaN`, () => {
      const model = node(width, height);
      const event = new PointerEvent('pointermove');
      const gesture = startResize(
        {
          node: model,
          position: 'bottom-right',
          bounds: { minWidth: 0, minHeight: 0, maxWidth: Infinity, maxHeight: Infinity },
          keepAspectRatio: true,
          onStart: () => {},
          onResize: () => {},
          onEnd: () => {},
        },
        event,
        { x: width, y: height },
      );

      gesture.move(event, { x: width + 40, y: height + 30 });

      expect(Number.isFinite(model.width())).toBe(true);
      expect(Number.isFinite(model.height())).toBe(true);
      expect(model.width()).toBeGreaterThan(0);
    });
  }
});
