---
keyword: 'PackagesRouting'
---

`@vflow/routing` routes an edge around the nodes between its ends: an orthogonal path with rounded corners that keeps a clearance from every node in its way. It is a `CurveFactory`, so it works wherever a curve does: on an edge, on the connection preview, with markers and labels.

Drag a node to see the edges reroute. The edge from C to D runs inside its group: the nodes of an edge and their ancestors are never obstacles.

{{ NgDocActions.demoPane("RoutingDemoComponent") }}

## Installation

```bash
npm i @vflow/routing
```

The package depends on `ngx-vflow` 3 and ships no styles.

## Usage

Register `avoidNodesCurve`, or a curve built with your own options, under a key with `withCurves()` inside `provideVflow()`, and name the key as the curve of an edge, next to the built-in `'bezier'` or `'smooth-step'`:

```ts
import { avoidNodesCurve, createAvoidNodesCurve } from '@vflow/routing';
import { provideVflow, withCurves } from 'ngx-vflow';

@Component({
  providers: [
    provideVflow(withCurves({ avoid: avoidNodesCurve, tight: createAvoidNodesCurve({ nodePadding: 24, cornerRadius: 0 }) })),
  ],
  ...
})
export class EditorComponent {
  edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b', curve: 'avoid' },
    { id: 'b-c', source: 'b', target: 'c', curve: 'tight' },
  ]);
}
```

The graph then holds no functions and serializes as data. A factory still works directly in `curve` where a graph is built in code. The connection preview takes the same keys: `[connection]="{ curve: 'avoid' }"`. See [Curves](../../edges/curves#curves-by-key) for the keys and their type checking.

## Options

| Option             | Default | Meaning                                                                                                                                            |
| ------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nodePadding`      | `14`    | Clearance kept between the path and the nodes it routes around, in flow units.                                                                     |
| `approachDistance` | `24`    | Straight segment leaving a handle before the first bend, in addition to `nodePadding`.                                                             |
| `cornerRadius`     | `8`     | Radius of the rounded corners; `0` draws sharp corners.                                                                                            |
| `gridSpacing`      | `20`    | Distance of the routing lanes from the sides of the obstacles.                                                                                     |
| `bendPenalty`      | `50`    | Cost of a bend relative to one unit of length: higher values prefer fewer corners.                                                                 |
| `obstacleMargin`   | `280`   | Nodes farther than this from the rectangle spanned by the two handles are ignored.                                                                 |
| `isObstacle`       | all     | `(node: NodeGeometry) => boolean`: which nodes to route around, for example not the comments.                                                      |
| `inertia`          | `0.3`   | Discount on the length of the segments along the route the edge had: it changes route only for one about 30% shorter. `0` recomputes from scratch. |

## Obstacles

The curve reads `nodeGeometries` from its parameters: the rendered rectangle of every node, so content-sized nodes count with their measured size. The ancestors of the nodes of the edge are left out, which keeps an edge between two children inside their parent instead of sending it around the parent. The nodes of the edge themselves stay obstacles, so a handle that faces away from the other end is reached around its node, never through it.

Near a handle the clearance adapts: a neighbour closer than `nodePadding` keeps its distance instead of swallowing the handle, and the straight exit from the handle shortens to what the neighbours leave. When no exit exists, for example between overlapping nodes, the curve falls back to a smooth step between the handles.

The layout returns `labelPoints` with the direction of the path at the start, center and end, so labels declared with `vEdgeLabel` render, and `bounds`, so virtualization needs no SVG measurement.

## Stability while dragging

Two routes around an obstacle often cost almost the same, and a node dragged by a pixel would make the curve flip between them. Each curve remembers the last route of every edge and discounts the segments along it by `inertia`, so the route holds until another one is clearly shorter. Neighbouring edges keep their routes the same way while a node moves through their corridor. The memory is per edge object and per curve: `avoidNodesCurve` shares one, `createAvoidNodesCurve()` creates its own.

## Limits

The path of each edge is computed on demand, inside the flow, whenever a node it depends on moves. A curve that reads `nodeGeometries` depends on every node, so dragging one node recomputes every routed edge. One edge costs about 0.25 ms in a flow of 200 nodes (Chromium, laptop), so a few hundred routed edges still fit in a frame, and larger graphs feel the cost while dragging. Mixing curves helps: route the edges that cross busy areas and keep `smooth-step` for the rest.

The route follows horizontal and vertical lanes along the sides of the obstacles. A handle that faces away from the other end costs a loop around its node, which is the shape the handle asks for. Two nodes closer to each other than a few flow units, or overlapping ones, get the smooth-step fallback.
