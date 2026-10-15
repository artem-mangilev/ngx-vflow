export type EdgeChange = EdgeDetachedChange | EdgeAddChange | EdgeRemoveChange | EdgeSelectedChange;

/**
 * Reports that the edge is already detached from rendered endpoints.
 *
 * @experimental
 */
export interface EdgeDetachedChange extends EdgeChangeShared {
  type: 'detached';
}

/** Reports that the edge is already present in the application-provided collection. */
export interface EdgeAddChange extends EdgeChangeShared {
  type: 'add';
}

/** Reports that the edge is already absent from the application-provided collection. */
export interface EdgeRemoveChange extends EdgeChangeShared {
  type: 'remove';
}

/** Reports a selection value that has already been written to the edge's `selected` signal. */
export interface EdgeSelectedChange extends EdgeChangeShared {
  type: 'select';
  selected: boolean;
}

interface EdgeChangeShared {
  id: string;
}
