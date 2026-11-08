---
keyword: 'PackagesLayout'
---

`@vflow/layout` lays the nodes of a flow out automatically. The package has three parts: a layout contract, a host directive that measures the nodes, runs an algorithm and writes the positions back, with a companion directive that animates them, and adapters for layout engines in secondary entry points, each with an optional dependency.

## Installation

```bash
npm i @vflow/layout
npm i @dagrejs/dagre   # for @vflow/layout/dagre
npm i elkjs            # for @vflow/layout/elk
npm i d3-hierarchy     # for @vflow/layout/d3-hierarchy
npm i d3-force         # for @vflow/layout/d3-force
```

The package depends on `ngx-vflow` 3 and `rxjs`. Install only the engines you import: an application that imports `@vflow/layout/dagre` never bundles `elkjs`.

## Usage

```html
<vflow [vxLayout]="layout" vxLayoutAnimate [nodes]="nodes" [edges]="edges" />
```

```ts
import { VxLayout, VxLayoutAnimate } from '@vflow/layout';
import { dagreLayout } from '@vflow/layout/dagre';

export class FlowComponent {
  // Created once: a new function starts a new layout, so build it in the component, not in the template.
  readonly layout = dagreLayout({ rankdir: 'LR' });
}
```

The host runs the algorithm once every node is measured, so content-sized nodes count with their real size, and before the flow paints: it holds the initialization of the flow until the first positions are in, so the graph appears laid out, `(initialized)` sees it that way and a `fitView()` there fits the layout. The host runs again when the algorithm or the set of nodes and edges changes; a move or a resize does not count. A run that a newer one replaces is dropped, and a node being dragged keeps its position. Positions are converted into the node space of each parent, so nested nodes work with every adapter that understands them.

| `VxLayout`    | Default | Meaning                                                                                                                                                                                                                                       |
| ------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vxLayout`    | `null`  | A `LayoutAlgorithm`. Without one (`<vflow vxLayout>`) the layout runs only through `run(algorithm)` of the directive, for example from a button.                                                                                              |
| `vxLayoutEnd` |         | Emits the result once the positions are applied, after any animation, or when a continuous layout completes; a good moment to call `fitView()`. The first one comes before the flow paints, so fit without a duration there, as the demos do. |

The host places the positions, and the sizes an algorithm gives to parents, at once. `VxLayoutAnimate` on the same element animates the nodes into the layouts instead, positions and sizes together, except the first positions, which land before the flow paints. It is meant for layouts with one result: a continuous layout moves the nodes itself.

| `VxLayoutAnimate` | Default | Meaning                                                                                             |
| ----------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `vxLayoutAnimate` | `true`  | `true` or the options of the animator: `duration`, or `speed` with `minDuration` and `maxDuration`. |

The animation is a position writer: a directive that provides `VX_LAYOUT_POSITION_WRITER` on the flow element writes the positions in place of the host, told whether they are the first, so a different transition takes the same route.

## Dagre

`dagreLayout(options)` ranks a directed graph with [dagre](https://github.com/dagrejs/dagre): `rankdir`, `nodesep`, `ranksep`, `align`, `ranker` and the other graph options. Nested nodes become compound nodes, sized around their children with `padding` (20 by default) between them and the sides.

{{ NgDocActions.demoPane("LayoutDagreDemoComponent") }}

## ELK

`elkLayout(options)` runs the [Eclipse Layout Kernel](https://eclipse.dev/elk/) through `elkjs` in the main thread. The options are typed, so no ELK option keys reach your code: `algorithm` (`layered`, `mrtree`, `stress`, `force`, `radial`, `box`, `rectpacking`), `direction`, `nodeSpacing`, `layerSpacing`, `edgeNodeSpacing`, `padding`, `nodePlacement`, `edgeRouting`, `separateConnectedComponents` and `aspectRatio`. Nested nodes are ELK children, laid out with their parents.

{{ NgDocActions.demoPane("LayoutElkDemoComponent") }}

## d3-hierarchy

`treeLayout(options)` lays a tree, or a forest, out level by level with the tidy tree of [d3-hierarchy](https://github.com/d3/d3-hierarchy): siblings side by side, each subtree under its parent, in a `direction` with `nodeSpacing` between siblings and `levelSpacing` between levels. Every node counts with its own size, so cards of different widths do not overlap, and the levels are aligned at their start. A node's parent is the source of its first incoming edge, a node without one is a root. `radialTreeLayout(options)` puts the root at the `center` and the levels on rings `levelSpacing` apart, as a mind map. The cards of the demo carry one floating handle, `position="auto"`, so an edge meets a card on the side that faces the other end, whichever way the tree grows.

{{ NgDocActions.demoPane("LayoutTreeDemoComponent") }}

## d3-force

`forceLayout(options)` is a continuous layout: a [d3-force](https://github.com/d3/d3-force) simulation moves the nodes on every tick until it settles, starting from where they are. `linkDistance`, `chargeStrength`, `center`, `collide` and `alphaDecay` tune it. Drag a ball: the host reports the drag to the algorithm, which pins the node under the pointer and warms the simulation up again, as d3-drag does. The simulation stays ready for the next drag, so this layout never completes and `vxLayoutEnd` does not fire for it. The balls of the demo are plain nodes whose whole surface is a handle with `position="center"`, so the straight edges meet them at their centers.

{{ NgDocActions.demoPane("LayoutForceDemoComponent") }}

## Your own algorithm

A `LayoutAlgorithm` is a function of the graph and a context: the nodes with their rendered `width` and `height`, their `parentId` and their current `x` and `y` in flow space, and the edges, each between two nodes of the graph; the context carries the drags of nodes while the layout runs, for continuous layouts to follow. It returns an observable of results, `positions` in flow space and optional `sizes` for the parents it lays out around their children: one value for a one-shot layout (`of(result)`, or `defer` around a promise), a value per step for a continuous one. `createNodeAnimator` from the package moves nodes between positions and sizes on its own, outside the host: `animate(targets)` takes a map of nodes to their node-space `point` and optional `size`.

```ts
const columns: LayoutAlgorithm = (graph) => of({ positions: new Map(graph.nodes.map((node, i) => [node.id, { x: i * (node.width + 40), y: 0 }])) });
```
