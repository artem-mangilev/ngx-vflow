# @vflow/layout

Automatic layouts for [ngx-vflow](https://www.ngx-vflow.org/): a layout contract, a host directive that measures the nodes, runs an algorithm and writes the positions back, and adapters for layout engines.

```bash
npm i @vflow/layout
```

```html
<vflow [vxLayout]="layout" vxLayoutAnimate [nodes]="nodes" [edges]="edges" />
```

```ts
import { VxLayout, VxLayoutAnimate, LayoutAlgorithm } from '@vflow/layout';

// Any function of the graph to an observable of positions in flow space: one value, or one per step.
const layout: LayoutAlgorithm = (graph) => of({ positions: new Map(graph.nodes.map((node, i) => [node.id, { x: i * (node.width + 40), y: 0 }])) });
```

The layout runs once every node is measured, so content-sized nodes count with their real size, and again when the algorithm or the set of nodes and edges changes; a new algorithm function lays the graph out anew. A node being dragged keeps its position; a run that a newer one replaces is dropped. `VxLayoutAnimate` animates the layouts after the first, and `createNodePositionAnimator` moves nodes between positions on its own.

Adapters live in secondary entry points with optional peer dependencies: `@vflow/layout/dagre`, `@vflow/layout/elk` and `@vflow/layout/d3-force`. See the [Layout](https://www.ngx-vflow.org/packages/layout) page. Requires `ngx-vflow` 3 and Angular 20, 21 or 22. Versions and releases are shared with `ngx-vflow`.
