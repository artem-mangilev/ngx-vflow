import { InjectionToken } from '@angular/core';
import { Node, Point } from 'ngx-vflow';

/** Where a layout puts a node: its node-space position and, for a parent the layout sized, its size. */
export interface NodeTarget {
  point: Point;
  size?: { width: number; height: number };
}

export type NodeTargets = ReadonlyMap<Node, NodeTarget>;

/**
 * Writes the targets of a layout into the `point`, `width` and `height` signals of nodes. `VxLayout` takes it from
 * its element, where a directive such as `VxLayoutAnimate` may provide one; by default the targets are placed at
 * once.
 */
export interface LayoutPositionWriter {
  /**
   * Moves the nodes to the targets; resolves once they are there, or once a later write or `cancel` replaced it.
   * `first` marks the first positions of the flow, which land before it paints.
   */
  write(targets: NodeTargets, context: { first: boolean }): Promise<void>;
  /** Stops a write in progress, before a new layout starts. */
  cancel(): void;
}

export const VX_LAYOUT_POSITION_WRITER = new InjectionToken<LayoutPositionWriter>('VX_LAYOUT_POSITION_WRITER', {
  providedIn: 'root',
  factory: (): LayoutPositionWriter => ({
    write: (targets) => {
      placeNodes(targets);
      return Promise.resolve();
    },
    cancel: () => undefined,
  }),
});

/** Sets the targets at once. A size reaches only a node with an explicit size. */
export function placeNodes(targets: NodeTargets): void {
  for (const [node, { point, size }] of targets) {
    node.point.set(point);
    if (size) {
      node.width?.set(size.width);
      node.height?.set(size.height);
    }
  }
}
