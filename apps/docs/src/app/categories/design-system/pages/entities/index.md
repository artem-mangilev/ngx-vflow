The same `vflowField` structure serves Customer/Order relationships and CRM/ERP mapping.
Handles use stable field IDs: renaming and reversing rows preserve endpoints.
Input and output IDs (`in:field-id`, `out:field-id`) are independent of names.
Connect matching types; remove a connection with its label button. Type compatibility and
structural graph changes belong to the application, not the UI directive.

{{ NgDocActions.demo("EntitiesDemoComponent", { container: false }) }}

```typescript file="./entities-demo.component.ts"

```

The `1 → N` label illustrates cardinality, not SQL validation or a crow's-foot marker.
Delete CRM email field explicitly removes incident edges before removing the field. Rename and
reorder never change field/handle IDs.

## Scrollable and collapsible fields

Enable **Scrollable fields**, then scroll a field list at different zoom levels. The application
uses `vflowNoWheel` and `vflowNoDrag` to keep list scrolling separate from graph gestures.
Persistent port anchors live outside the scrolling content, so `overflow` cannot clip them.
Visible rows determine port positions; hidden rows dock to the nearest visible boundary, with
spacing to keep this demo's ports distinct. **Collapse fields** hides only the rows and docks
the same handles along the header. Expanding restores row placement without recreating handles
or changing IDs and connections.

`EntityPortsDirective` owns this docking policy. After its CSS writes it emits `portsPlaced`,
and the application calls `flow.refreshNodeHandles([nodeId])` to request batched measurement.
The engine observes native scroll, but it does not choose a hidden-field policy or move ports.

```typescript file="./entity-ports.directive.ts"

```

This recipe targets small fixed field sets. Large or virtualized lists need an explicit policy
for port crowding, labels and handle lifetime; there is no universal automatic docking or
field virtualization contract. Removing a handle still detaches its incident connections.
