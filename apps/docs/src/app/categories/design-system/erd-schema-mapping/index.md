Two diagrams on one canvas, each in a titled frame: Customer/Order relationships and CRM/ERP field mapping use the
same `vuiRow` structure. Handles use stable field IDs, so renaming a field or reordering rows preserves endpoints.
Input and output IDs are distinct (`in:field-id` and `out:field-id`) and independent of visible names.

Free ports and row actions show when a row is hovered or focused, or its table is selected; connected ports always
show. Drag between ports of matching types to add a connection, labelled by what it does. Remove a connection with
its label button or select it and press Delete. Deleting a field is handled by the application: the field and every
edge on it go together. Type compatibility and graph changes belong to this application, not to the UI directive.
Frames are parents drawn below the edges (`parentsBelowEdges`), so connections inside them stay selectable.

{{ NgDocActions.demo("EntitiesDemoComponent", { container: false }) }}

```typescript file="./entities-demo.component.ts"

```

## Scroll and collapse experiment

Long entities need a policy for endpoints of hidden rows. Scroll the Product rows with the wheel; collapse a node
to move its endpoints to the header. This experiment is local to the demo and is not a
library contract. Collapsing moves every endpoint to the header by rendering proxy handles with the same IDs.
Scrolling keeps rows mounted in an overflow container that owns the wheel through `vNoWheel`; rows scrolled
out of view hand their endpoints to proxy handles at the nearest border, rows still in view are re-created so
core measures them again.

{{ NgDocActions.demo("ScrollCollapseDemoComponent", { container: false }) }}

```typescript file="./scroll-collapse-demo.component.ts"

```

Findings:

- Model and IDs survive both operations; edges are never removed or re-created by the UI.
- Collapse with proxy handles keeps every edge attached to the header; expand puts the endpoints back on the rows.
- Core positions handles in the node's coordinate space from measurements taken after render and resize. It does
  not observe scroll: without the policy above, handles of scrolled rows keep their measured positions and are
  drawn outside the node, and a visible row's handle stays where the row was before the scroll.
- Re-creating visible rows on scroll makes core measure them again; it is a demo trick, not a recommended API.
- Zoom does not change the picture: endpoints stay on the visible rows at any zoom level.
- Without `vNoWheel` the wheel zooms the graph instead of scrolling the rows.

The `1 → N` label illustrates cardinality; it is not SQL schema validation or a crow's-foot marker.
