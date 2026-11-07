---
keyword: 'PackagesLayout'
---

`@vflow/layout` lays the nodes of a flow out automatically. The package has three parts: a layout contract, a host directive that measures the nodes, runs an algorithm and writes the positions back, and adapters for layout engines in secondary entry points, each with an optional dependency.

## Installation

```bash
npm i @vflow/layout
npm i @dagrejs/dagre   # for @vflow/layout/dagre
npm i elkjs            # for @vflow/layout/elk
npm i d3-force         # for @vflow/layout/d3-force
```

The package depends on `ngx-vflow` 3 and `rxjs`. Install only the engines you import: an application that imports `@vflow/layout/dagre` never bundles `elkjs`.

## Usage

```html
<vflow [vxLayout]="layout" [vxLayoutAnimate]="true" [nodes]="nodes" [edges]="edges" />
```

```ts
import { VxLayout } from '@vflow/layout';
import { dagreLayout } from '@vflow/layout/dagre';

export class FlowComponent {
  // Created once: a new function starts a new layout, so build it in the component, not in the template.
  readonly layout = dagreLayout({ rankdir: 'LR' });
}
```

The host runs the algorithm once every node is measured, so content-sized nodes count with their real size, and before the flow paints: it holds the initialization of the flow until the first positions are in, so the graph appears laid out, `(initialized)` sees it that way and a `fitView()` there fits the layout. The first layout never animates; `vxLayoutAnimate` applies to the layouts that follow. The host runs again when the algorithm or the set of nodes and edges changes; a move or a resize does not count. A result that arrives after a newer run started is dropped, and a node being dragged keeps its position. Positions are converted into the node space of each parent, so nested nodes work with every adapter that understands them.

| Input / output    | Default  | Meaning                                                                                                                                                                                                                                       |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vxLayout`        | required | A `LayoutAlgorithm`.                                                                                                                                                                                                                          |
| `vxLayoutTrigger` | `'auto'` | `'manual'` runs the layout only through `run()` of the directive, for example from a button.                                                                                                                                                  |
| `vxLayoutAnimate` | `false`  | `true` or the options of the animator: `duration`, or `speed` with `minDuration` and `maxDuration`.                                                                                                                                           |
| `vxLayoutEnd`     |          | Emits the result once the positions are applied, after any animation, or when a continuous layout completes; a good moment to call `fitView()`. The first one comes before the flow paints, so fit without a duration there, as the demos do. |

## Dagre

`dagreLayout(options)` ranks a directed graph with [dagre](https://github.com/dagrejs/dagre): `rankdir`, `nodesep`, `ranksep`, `align`, `ranker` and the other graph options. Nested nodes become compound nodes, sized around their children with `padding` (20 by default) between them and the sides.

{{ NgDocActions.demoPane("LayoutDagreDemoComponent") }}

## ELK

`elkLayout(options)` runs the [Eclipse Layout Kernel](https://eclipse.dev/elk/) through `elkjs` in the main thread. The options are typed, so no ELK option keys reach your code: `algorithm` (`layered`, `mrtree`, `stress`, `force`, `radial`, `box`, `rectpacking`), `direction`, `nodeSpacing`, `layerSpacing`, `edgeNodeSpacing`, `padding`, `nodePlacement`, `edgeRouting`, `separateConnectedComponents` and `aspectRatio`. Nested nodes are ELK children, laid out with their parents.

{{ NgDocActions.demoPane("LayoutElkDemoComponent") }}

## d3-force

`forceLayout(options)` is a continuous layout: a [d3-force](https://github.com/d3/d3-force) simulation moves the nodes on every tick until it settles, starting from where they are. `linkDistance`, `chargeStrength`, `center`, `collide` and `alphaDecay` tune it. Drag a ball: the host reports the drag to the algorithm, which pins the node under the pointer and warms the simulation up again, as d3-drag does. The simulation stays ready for the next drag, so this layout never completes and `vxLayoutEnd` does not fire for it. The balls of the demo are plain nodes whose whole surface is a handle with `position="center"`, so the straight edges meet them at their centers.

{{ NgDocActions.demoPane("LayoutForceDemoComponent") }}

## Your own algorithm

A `LayoutAlgorithm` is a function of the graph and a context: the nodes with their rendered `width` and `height`, their `parentId` and their current `x` and `y` in flow space, and the edges; the context carries the drags of nodes while the layout runs, for continuous layouts to follow. It returns `positions` in flow space, at once, as a promise or as an observable, and may return `sizes` for the parents it lays out around their children. `createNodePositionAnimator` from the package moves nodes between positions on its own, outside the host.

```ts
const columns: LayoutAlgorithm = (graph) => ({
  positions: new Map(graph.nodes.map((node, i) => [node.id, { x: i * (node.width + 40), y: 0 }])),
});
```
