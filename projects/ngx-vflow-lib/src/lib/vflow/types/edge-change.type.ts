export type EdgeChange = EdgeDetachedChange | EdgeAddChange | EdgeRemoveChange | EdgeSelectChange;

/**
 * @experimental
 */
export interface EdgeDetachedChange extends EdgeChangeShared {
  type: 'detached';
}

export interface EdgeAddChange extends EdgeChangeShared {
  type: 'add';
}

export interface EdgeRemoveChange extends EdgeChangeShared {
  type: 'remove';
}

export interface EdgeSelectChange extends EdgeChangeShared {
  type: 'select';
  selected: boolean;
}

interface EdgeChangeShared {
  id: string;
}
