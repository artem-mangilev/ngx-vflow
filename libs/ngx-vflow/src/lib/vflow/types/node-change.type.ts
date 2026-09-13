import { Point } from '../interfaces/point.interface';

export type NodeChange = NodePositionChange | NodeSizeChange | NodeAddChange | NodeRemoveChange | NodeSelectedChange;

/** Reports a position that has already been written to the node's `point` signal. */
export interface NodePositionChange extends NodeChangeShared {
  type: 'position';
  point: Point;
}

/**
 * `auto`: the size mirrors the measured DOM; `explicit`: the size was supplied by the
 * application or written by the resizer and the library renders it as inline width/height.
 */
export type NodeSizeMode = 'auto' | 'explicit';

/** Reports a size that has already been written to the node's size signals. */
export interface NodeSizeChange extends NodeChangeShared {
  type: 'size';
  size: { width: number; height: number };
  /** Persist the size only when `explicit`; an `auto` size is a measurement of content. */
  mode: NodeSizeMode;
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
