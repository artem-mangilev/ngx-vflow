One flow with the parts of an editor together. Every node shows a feature and is named after it, and the values in the nodes are live: they follow the edges, the drags and the resizes.

{{ NgDocActions.demoPane("AllFeaturesDemoComponent") }}

What to try:

- **Resize a node.** Select the "Resizer and toolbar" node or the group and drag a control. The "Size" node shows the new size while you drag. See [Resizing](/docs/nodes/resizer).
- **Use the toolbar.** The selected node carries a toolbar that duplicates or deletes it. See [Node toolbar](/docs/nodes/node-toolbar).
- **Connect ports.** Drag from the "count" row of the table to the "Input" block: the block lists the fields it receives. A port sits on any side of a node, next to the content it belongs to. See [Handles](/docs/handles/handles).
- **Break a rule.** The port of an inspector accepts one edge: drag a second one to it, and the port turns red and refuses it. See [Connections](/docs/handles/connections).
- **Reconnect an edge.** Drag the start of an edge that ends in an inspector to a row of the table: the inspector now reads the table.
- **Remove things.** An edge with a button is a component with an output. `Delete` and `Backspace` remove what is selected. See [Custom edges](/docs/edges/custom-edges) and [Delete selected](/examples/recipes/delete-selected).
- **Select several nodes.** Hold `Shift` and drag a box over them, then move them together. See [Selection](/docs/interactions/selection).
- **Change the canvas.** The "Controls in a node" node turns the grid and the alignment guides on and off, and changes the background and the curve of every edge. Only its header drags it. See [Snapping and alignment](/docs/viewport/snapping), [Background](/docs/viewport/background), [Curves](/docs/edges/curves) and [Dragging](/docs/nodes/draggables).
- **Move the group.** The inspectors are its children: they move with it and stay inside it. See [Subflows](/docs/nodes/subflows).
- **Navigate.** Drag or scroll over the minimap, or use the zoom buttons. See [Minimap](/docs/viewport/minimap).

```typescript group="feature-overview" name="all-features-demo.component.ts" file="./demo/all-features-demo.component.ts"

```

```typescript group="feature-overview" name="flow-store.service.ts" file="./demo/services/flow-store.service.ts"

```

```typescript group="feature-overview" name="resizable-node.component.ts" file="./demo/components/resizable-node.component.ts"

```

```typescript group="feature-overview" name="table-node.component.ts" file="./demo/components/table-node.component.ts"

```

```typescript group="feature-overview" name="settings-node.component.ts" file="./demo/components/settings-node.component.ts"

```

```typescript group="feature-overview" name="group-node.component.ts" file="./demo/components/group-node.component.ts"

```

```typescript group="feature-overview" name="inspector-node.component.ts" file="./demo/components/inspector-node.component.ts"

```

```typescript group="feature-overview" name="removable-edge.component.ts" file="./demo/components/removable-edge.component.ts"

```
