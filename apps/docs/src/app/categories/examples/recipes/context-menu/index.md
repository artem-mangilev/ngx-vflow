Right-click a node, an edge or the empty canvas: each opens its own menu. On a focused node or edge the context-menu
key and `Shift+F10` open it too, and `Escape` closes it.

{{ NgDocActions.demoPane("ContextMenuDemoComponent") }}

- One native `(contextmenu)` listener on `vflow` serves the whole flow. The host of a node carries its id in
  `data-v-node`, the host of an edge in `data-v-edge`, so `closest()` on the event target tells what was clicked.
  Anything else is the canvas, and `clientToFlowPosition()` turns the pointer into the point of a new node.
- The menu is an element of the demo, not of the flow: it sits over the flow, at the pointer, and does not pan or
  zoom with the graph. Focus moves into it when it opens, and leaving it closes it.
- Every action changes the application's arrays with the graph operations: `addNodes()` and `removeElements()`.
