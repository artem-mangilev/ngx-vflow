import { Point } from '../interfaces/point.interface';

export type NodeChange = NodePositionChange | NodeSizeChange | NodeAddChange | NodeRemoveChange | NodeSelectedChange;

/** Reports a position that has already been written to the node's `point` signal. */
export interface NodePositionChange extends NodeChangeShared {
  type: 'position';
  point: Point;
}

/**
 * Mode of one size axis. `auto`: the axis follows the rendered content; `explicit`: the axis is fixed by the node's
 * `width`/`height` signal or by the resizer, and the library renders it as an inline size.
 */
export type NodeSizeMode = 'auto' | 'explicit';

/** Reports a change of the rendered size. The node's `width`/`height` signals change only by resizing. */
export interface NodeSizeChange extends NodeChangeShared {
  type: 'size';
  /** Rendered size in flow units, as measured. */
  size: { width: number; height: number };
  /** Persist an axis only when it is `explicit`; an `auto` axis is a measurement of content. */
  mode: { width: NodeSizeMode; height: NodeSizeMode };
}

/** Reports that the node is already present in the application-provided collection. */
export interface NodeAddChange extends NodeChangeShared {
  type: 'add';
}

/** Reports that the node is already absent from the application-provided collection. */
export interface NodeRemoveChange extends NodeChangeShared {
  type: 'remove';
}

/** Reports a selection value that has already been written to the node's `selected` signal. */
export interface NodeSelectedChange extends NodeChangeShared {
  type: 'select';
  selected: boolean;
}

interface NodeChangeShared {
  id: string;
}
