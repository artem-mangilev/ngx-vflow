The same `vflowField` structure serves both Customer/Order relationships and CRM/ERP mapping.
Handles use stable field IDs, so renaming a field and reversing rows preserve endpoints.
Input and output IDs are distinct (`in:field-id` and `out:field-id`) and independent of visible names.
Drag between ports of matching types to add a connection; remove it using its label button.
Deleting a field is handled by the application: the field and every edge on it go together.
Type compatibility and graph changes belong to this application, not to the UI directive.

{{ NgDocActions.demo("EntitiesDemoComponent", { container: false }) }}

```typescript file="./entities-demo.component.ts"

```

## Scroll and collapse experiment

Long entities need a policy for endpoints of hidden rows. This experiment is local to the demo and is not a
library contract. Collapsing moves every endpoint to the header by rendering proxy handles with the same IDs.
Scrolling keeps rows mounted in an overflow container that owns the wheel through `vflowNoWheel`; rows scrolled
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
- Without `vflowNoWheel` the wheel zooms the graph instead of scrolling the rows.

The `1 → N` label illustrates cardinality; it is not SQL schema validation or a crow's-foot marker.
