The same `vflowField` structure serves both Customer/Order relationships and CRM/ERP mapping.
Handles use stable field IDs, so renaming a field and reversing rows preserve endpoints.
Input and output IDs are distinct (`in:field-id` and `out:field-id`) and independent of visible names.
Drag between ports of matching types to add a connection; remove it using its label button.
Type compatibility and graph changes belong to this application, not to the UI directive.

{{ NgDocActions.demo("EntitiesDemoComponent", { container: false }) }}

```typescript file="../../demos/entities-demo.component.ts"

```

## Scroll/collapse experiment

Enable Scroll experiment to constrain the field list, then scroll it at different zoom levels.
Collapse fields keeps field/handle IDs and graph edges in the application model; expand remounts
no fields. Delete CRM email explicitly removes incident edges before removing the field.

This deliberately uses native overflow and display hiding, with no endpoint relocation policy.
Hidden endpoints can retain their last measured position; scroll does not itself notify the core
measurement controller. The demo does not claim stable scroll/collapse support. Inspect endpoint
alignment after expanding. `vflowNoDrag` and `vflowNoWheel` keep field-list gestures local.
The `1 → N` label illustrates cardinality, not SQL validation or a crow's-foot marker.
