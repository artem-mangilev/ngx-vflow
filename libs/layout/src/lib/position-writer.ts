import { InjectionToken } from '@angular/core';
import { Node, Point } from 'ngx-vflow';

/**
 * Writes node-space positions into the `point` signals of nodes. `VxLayout` takes it from its element, where a
 * directive such as `VxLayoutAnimate` may provide one; by default the positions are placed at once.
 */
export interface LayoutPositionWriter {
  /**
   * Moves the nodes to the targets; resolves once they are there, or once a later write or `cancel` replaced it.
   * `first` marks the first positions of the flow, which land before it paints.
   */
  write(targets: ReadonlyMap<Node, Point>, context: { first: boolean }): Promise<void>;
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

/** Sets the positions at once. */
export function placeNodes(targets: ReadonlyMap<Node, Point>): void {
  for (const [node, point] of targets) node.point.set(point);
}
