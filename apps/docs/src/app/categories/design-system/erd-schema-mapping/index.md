The same `vflowField` structure serves both Customer/Order relationships and CRM/ERP mapping.
Handles use stable field IDs, so renaming a field and reversing rows preserve endpoints.
Input and output IDs are distinct (`in:field-id` and `out:field-id`) and independent of visible names.
Drag between ports of matching types to add a connection; remove it using its label button.
Type compatibility and graph changes belong to this application, not to the UI directive.

{{ NgDocActions.demo("EntitiesDemoComponent", { container: false }) }}

```typescript file="./entities-demo.component.ts"

```

## Limitations

Rows remain mounted: this demo does not implement internal scrolling, collapsing or virtualized
field lists. Those features need an explicit policy for connections to hidden fields.
The `1 → N` label illustrates cardinality; it is not SQL schema validation or a crow's-foot marker.
