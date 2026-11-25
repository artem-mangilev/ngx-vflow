The graph belongs to the application, so history is the application's too: before every change the example keeps a
copy of the graph, and undo puts the copy back. Move a node, connect two handles or delete something, then press
Undo or `Mod+Z`, and Redo or `Mod+Shift+Z`, while focus is inside the demo.

{{ NgDocActions.demoPane("UndoRedoDemoComponent") }}

- A node holds signals that change in place while it is dragged, so a copy is taken with `toStaticNodes()` and
  `toStaticEdges()`. Restoring writes the copy back into the nodes that still exist and creates only the missing ones
  with `createNodes()`: the other nodes keep their views, so a keyboard user keeps the focus and can undo again.
- `(nodeDragStart)` records the graph before a move; a press that does not move the node is a click and records
  nothing. `(connect)` and `(deleteRequest)` record it before the application applies them.
- A new change clears the redo list, as in any editor.

A copy of the whole graph is the simplest history and is cheap for graphs of a few hundred nodes. For larger graphs,
record the changes instead: the ids and points of the moved nodes from `(nodeDragStart)` and `(nodeDragEnd)`, the
added edge, the removed elements.
