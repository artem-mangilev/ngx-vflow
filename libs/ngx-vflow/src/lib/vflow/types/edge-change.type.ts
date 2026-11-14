/**
 * A change of an edge that has already happened. Adding and removing edges is not reported: the application owns the
 * array and makes those changes itself.
 */
export type EdgeChange = EdgeDetachedChange | EdgeSelectedChange;

/**
 * Reports that the edge is already detached from rendered endpoints: its source or target node is absent, or the
 * handle it names is not rendered on that node.
 *
 * @experimental
 */
export interface EdgeDetachedChange extends EdgeChangeShared {
  type: 'detached';
}

/** Reports a selection value that has already been written to the edge's `selected` signal. */
export interface EdgeSelectedChange extends EdgeChangeShared {
  type: 'select';
  selected: boolean;
}

interface EdgeChangeShared {
  id: string;
}
