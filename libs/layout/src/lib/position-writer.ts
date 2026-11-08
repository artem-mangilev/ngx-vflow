import { InjectionToken } from '@angular/core';
import { Node, Point } from 'ngx-vflow';

/**
 * Writes node-space positions into the `point` signals of nodes. `VxLayout` writes them at once, unless a directive
 * on the flow element provides a writer through {@link VX_LAYOUT_POSITION_WRITER}, as `VxLayoutAnimate` does.
 */
export interface LayoutPositionWriter {
  /** Moves the nodes to the targets; resolves `true` once they are there, `false` when a later write replaced it. */
  write(targets: ReadonlyMap<Node, Point>): Promise<boolean>;
  /** Stops a write in progress, before a new layout starts. */
  cancel(): void;
}

export const VX_LAYOUT_POSITION_WRITER = new InjectionToken<LayoutPositionWriter>('VX_LAYOUT_POSITION_WRITER');

/** Sets the positions at once. */
export function placeNodes(targets: ReadonlyMap<Node, Point>): void {
  for (const [node, point] of targets) node.point.set(point);
}
