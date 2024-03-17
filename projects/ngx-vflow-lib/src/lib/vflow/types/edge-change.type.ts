export type EdgeChange = EdgeDetachedChange | EdgeAddChange | EdgeRemoveChange

export interface EdgeDetachedChange extends EdgeChangeShared {
  type: 'detached'
}

export interface EdgeAddChange extends EdgeChangeShared {
  type: 'add'
}

export interface EdgeRemoveChange extends EdgeChangeShared {
  type: 'remove'
}

interface EdgeChangeShared {
  id: string
}
