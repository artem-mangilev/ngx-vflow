---
keyword: 'FeaturesDefaultEdges'
---

You can link nodes with edges. Create an `Edge[]` array and pass it to the `vflow` component. Each edge
contains the id of the `source` and `target` nodes and has its own `id`. Core routes the path and owns the
click selection; the visible line comes from your `<ng-template vEdge>`: bind `ctx.path()` to an SVG path, usually inside a
`<svg:g vEdgeInteraction>`, which lets the group style its hover. The `docs-edge` component used below draws the path with `@vflow/ui`.

{{ NgDocActions.demoPane("DefaultEdgesDemoComponent") }}

## Curves and markers

`curve` selects the routing (`bezier`, `straight`, `smooth-step`, `step` or a factory), `markers` adds
arrowheads that follow the edge's stroke color; see the curves and markers pages.
