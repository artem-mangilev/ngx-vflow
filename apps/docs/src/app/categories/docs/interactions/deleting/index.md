This guide shows how to delete nodes and edges. The flow never removes anything itself: the graph belongs to the
application, so the flow asks, and the application changes its arrays.

Select a node or an edge, or several with the selection box, and press `Delete` or `Backspace`. The bar reports what
was removed, and Restore brings the graph back.

{{ NgDocActions.demoPane("DeleteSelectedDemoComponent") }}

## Apply a delete request

`Delete` and `Backspace` on a focused node or edge emit `(deleteRequest)` with `{ nodeIds, edgeIds }`. Pass it to
`removeElements()`, which returns the new arrays:

```html
<vflow [nodes]="nodes()" [edges]="edges()" (deleteRequest)="remove($event)" />
```

```typescript
import { DeleteRequest, removeElements } from 'ngx-vflow';

protected remove(request: DeleteRequest): void {
  const result = removeElements(request, { nodes: this.nodes(), edges: this.edges() });
  this.nodes.set(result.nodes);
  this.edges.set(result.edges);
}
```

- The request holds the whole selection when the focused entity is selected, and only the focused entity otherwise.
- `removeElements()` also removes the descendants of a removed node and every edge attached to a removed node, and
  reports them in `removedNodes` and `removedEdges`.
- After the removal, focus returns to the page rather than jumping to another entity.

## Delete from a button or a menu

Build the same request yourself, for example from the selection:

```typescript
const request = {
  nodeIds: this.nodes()
    .filter((node) => node.selected?.())
    .map((node) => node.id),
  edgeIds: this.edges()
    .filter((edge) => edge.selected?.())
    .map((edge) => edge.id),
};
```

## Change or turn off the keys

The keys are the `delete` command of [keyboard shortcuts](/docs/interactions/keyboard-shortcuts):
`withShortcuts({ commands: { delete: ['x'] } })` rebinds them, and an empty list turns keyboard deletion off.
