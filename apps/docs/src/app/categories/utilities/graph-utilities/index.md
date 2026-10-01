Pure graph utilities work with application-owned `Node` and `Edge` collections. They read signals but do not mutate the collections or require a rendered flow.

## Topology

```ts
import { getConnectedEdges, getIncomers, getOutgoers } from 'ngx-vflow';

const connectedEdges = getConnectedEdges([selectedNode], edges);
const incomers = getIncomers(selectedNode, nodes, edges);
const outgoers = getOutgoers(selectedNode, nodes, edges);
```

Topology is node-level: `sourceHandle` and `targetHandle` do not affect these results. Connected edges preserve edge order and duplicates, while incoming and outgoing nodes are unique and retain node order. Edges with a missing opposite endpoint remain connected to the endpoint that exists.

## Rendered rectangles and bounds

Node data does not carry the rendered size of a content-sized node, so rectangles and bounds come from the rendered flow:

```ts
const flow = viewChild.required(VflowComponent);

const rect = flow().getNodeRect('node-1'); // { x, y, width, height } in flow space
const selectedBounds = flow().getNodesBounds(selectedIds);
const allBounds = flow().getNodesBounds();
```

`getNodeRect` returns the absolute position and the measured size, or `undefined` for an unknown node and a node that has not been measured yet. `getNodesBounds` skips such nodes and returns `{ x: 0, y: 0, width: 0, height: 0 }` when nothing is left. Nested nodes are in flow space.
