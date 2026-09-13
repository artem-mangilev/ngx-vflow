You can create markers for both edges and connections.

- **Edges**: Specify `start` and `end` markers for corresponding parts of the edge. Currently, markers are limited to two `type`s: `arrow` and `arrow-closed`. `width`, `height`, `orient` and `markerUnits` are optional.
- **Connections**: You can specify an end marker using the `marker` property in `ConnectionSettings`.

Markers take the stroke color of the edge that references them (`context-stroke`), so a themed or
selected edge colors its arrowheads automatically. Bind `ctx.markerStart()` / `ctx.markerEnd()` in your edge
template. For other shapes or stroke widths, style the public `.vflow-marker` classes or define your own
`<marker>` in the edge template.

{{ NgDocActions.demoPane("MarkersDemoComponent") }}
