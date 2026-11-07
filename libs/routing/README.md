# @vflow/routing

Obstacle-avoiding edge routing for [ngx-vflow](https://www.ngx-vflow.org/): an orthogonal path with rounded corners that keeps a clearance from the nodes between the ends of an edge.

```bash
npm i @vflow/routing
```

```ts
import { avoidNodesCurve, createAvoidNodesCurve } from '@vflow/routing';

const edges = createEdges([
  { id: 'a-b', source: 'a', target: 'b', curve: avoidNodesCurve },
  { id: 'b-c', source: 'b', target: 'c', curve: createAvoidNodesCurve({ nodePadding: 24 }) },
]);
```

`avoidNodesCurve` is a `CurveFactory`: set it on an edge or on the connection preview. The nodes of the edge and their ancestors are never obstacles, so an edge inside a parent routes within it.

See the [Routing](https://www.ngx-vflow.org/packages/routing) page for the options and limits. Requires `ngx-vflow` 3 and Angular 20, 21 or 22. Versions and releases are shared with `ngx-vflow`.
