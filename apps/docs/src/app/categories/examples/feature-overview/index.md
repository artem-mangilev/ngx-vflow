A small order workflow that shows the parts of an editor together. The notes on the canvas say what to try. They are not nodes: a [portal](/docs/viewport/portal) places them at points of the flow, so they pan and zoom with it while the guides, the minimap and the selection leave them out.

{{ NgDocActions.demoPane("AllFeaturesDemoComponent") }}

Where each part is described:

- The toolbar of a selected node: [Node toolbar](/docs/nodes/node-toolbar).
- Ports on any side of a node, and the rule that an input takes one edge: [Handles](/docs/handles/handles) and [Connections](/docs/handles/connections).
- The four curves, the labels, the edge drawn by a component and reconnecting: [Curves](/docs/edges/curves), [Labels](/docs/edges/labels), [Custom edges](/docs/edges/custom-edges) and [Connections](/docs/handles/connections).
- The group, its children and its resizer: [Subflows](/docs/nodes/subflows) and [Resizing](/docs/nodes/resizer).
- The alignment guides: [Snapping and alignment](/docs/viewport/snapping).
- The selection box and removing the selection with `Delete`: [Selection](/docs/interactions/selection) and [Delete selected](/examples/recipes/delete-selected).
- The minimap and the zoom buttons: [Minimap](/docs/viewport/minimap).

```typescript group="feature-overview" name="all-features-demo.component.ts" file="./demo/all-features-demo.component.ts"

```

```typescript group="feature-overview" name="flow-store.service.ts" file="./demo/services/flow-store.service.ts"

```

```typescript group="feature-overview" name="step-node.component.ts" file="./demo/components/step-node.component.ts"

```

```typescript group="feature-overview" name="note.component.ts" file="./demo/components/note.component.ts"

```

```typescript group="feature-overview" name="group-node.component.ts" file="./demo/components/group-node.component.ts"

```

```typescript group="feature-overview" name="removable-edge.component.ts" file="./demo/components/removable-edge.component.ts"

```
