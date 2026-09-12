Two team containers with their own connection, people with avatars and review meters, a metric card with a
trend and a note without ports. View mode keeps selection and keyboard navigation while moving and connecting
are switched off by the application.

{{ NgDocActions.demo("RelationshipsDemoComponent", { container: false }) }}

```typescript file="./relationships-demo.component.ts"

```

## What this page proves

- A `vflowContainer` on a `template-group` node carries its own handles and edges; membership of people in a team is graph data, not a visual rule.
- A note is a `vflowNode` without handles: canvas content that takes part in selection but not in the graph.
- Images and metrics are plain SVG and HTML inside `vflowNodeBody`; the library ships no chart or image component.
- View mode is application policy: `draggable` off and handles that neither start nor accept connections, with selection and focus untouched.
