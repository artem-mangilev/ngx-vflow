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

## Local scroll/collapse experiment

Enable Scroll experiment, then scroll a field list at different zoom levels. The application
uses `vflowNoWheel` and `vflowNoDrag` to keep list scrolling separate from graph gestures.
Collapse uses `display: none`, preserving mounted field IDs and graph edges. Expand restores
the rows and their measurements. This deliberately demonstrates the limitations of naive CSS:
core does not remeasure handles on scroll, and hidden endpoints may keep stale geometry.
No transfer to the header/boundary is implemented. Internal scrolling, collapse and
virtualization are **not** a supported library contract; a production application must choose
its hidden-endpoint policy. Removing handles instead of hiding them detaches their edges.
