It's possible to set `Curve` for both the edges and connection.

{{ NgDocActions.demoPane("CurvesDemoComponent") }}

## Curve factory

> **Warning**
> This is an experimental API

If the existing curves do not meet your needs, you can provide your own function that implements the `CurveFactory` signature. Besides the handle points and sides it receives the geometry of both nodes (`sourceNode`, `targetNode`) and `markerInset`, the distance by which the given points are already moved back from the arrow tips of the edge markers.

A factory that routes around other nodes reads `nodeGeometries`: the rendered rectangle of every node in flow space with its `parentId`, so the ancestors of the edge can be left out of the obstacles. `allNodes` holds the application objects, whose `width` and `height` a content-sized node does not have. `nodeGeometries` is resolved when the factory reads it, so a factory that does not read it is not recomputed when an unrelated node moves, and one that does is.

Labels render at the `labelPoints` of the layout. Each point may carry the direction of the path there as `angle`,
in degrees of flow space with `0` pointing right and `90` pointing down; a label with `orient: 'path'` turns by
it. Without `angle` the label stays horizontal.

With virtualization enabled, the library uses the complete path bounds to decide whether an edge can appear in the viewport. A custom factory may return an optional `bounds: { x, y, width, height }` in flow coordinates to avoid SVG measurement. These bounds must contain the whole curve, including any detours or control points. Without `bounds`, the library measures the SVG path when it changes and caches the result for viewport changes.

{{ NgDocActions.demoPane("CurveFactoryDemoComponent") }}
