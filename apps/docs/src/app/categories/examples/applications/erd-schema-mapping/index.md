Two diagrams on one canvas, each in a titled frame: Customer/Order relationships and CRM/ERP field mapping use the
same `vuiRow` structure. Handles use stable field IDs, so renaming a field or reordering rows preserves endpoints.
Input and output IDs are distinct (`in:field-id` and `out:field-id`) and independent of visible names.

Free ports and row actions show when a row is hovered or focused, or its table is selected; connected ports always
show. Drag between ports of matching types to add a connection, labelled by what it does. Remove a connection with
its label button or select it and press Delete.

Add a field from the last row of a table: type a name, pick a type and press Enter, or press Escape to drop the
draft; a taken name is refused. The new row gets its own ports at once, and the frame grows with the table. Tables and
frames are dragged freely, like any node: a frame moves its tables along and is not a boundary for them (`extent` is
lifted), and it grows only with their fields, not with where they are dragged. After
seven fields a table scrolls and shows its new last row; the endpoint of a row scrolled out of view stays on the
border of the list it left through, which core does for any scroll container inside a node. Deleting
a field is handled by the application: the field and every edge on it go together. Type compatibility and graph
changes belong to this application, not to the UI directive. Frames are parents drawn below the edges
(`parentsBelowEdges`), so connections inside them stay selectable.

{{ NgDocActions.demo("EntitiesDemoComponent", { container: false }) }}

```typescript file="./entities-demo.component.ts"

```

## Scroll and collapse experiment

Long entities need a policy for endpoints of hidden rows. Scroll the Product rows with the wheel; collapse a node
to move its endpoints to the header. Collapsing is a policy of this demo, not a library contract: it moves every
endpoint to the header by rendering proxy handles with the same IDs. Scrolling needs no code. Rows stay mounted in an
overflow container that owns the wheel through `vNoWheel`; core measures their handles again on scroll and keeps the
endpoint of a row scrolled out of view on the border of the container.

{{ NgDocActions.demo("ScrollCollapseDemoComponent", { container: false }) }}

```typescript file="./scroll-collapse-demo.component.ts"

```

Findings:

- Model and IDs survive both operations; edges are never removed or re-created by the UI.
- Collapse with proxy handles keeps every edge attached to the header; expand puts the endpoints back on the rows.
- Core measures handles again when a list scrolls inside the node. A handle whose row is out of view stays on the
  border of the scroll container, so its edge never ends outside of the list; several hidden rows share that point.
- Zoom does not change the picture: endpoints stay on the visible rows at any zoom level.
- Without `vNoWheel` the wheel zooms the graph instead of scrolling the rows.

The `1 → N` label illustrates cardinality; it is not SQL schema validation or a crow's-foot marker.
