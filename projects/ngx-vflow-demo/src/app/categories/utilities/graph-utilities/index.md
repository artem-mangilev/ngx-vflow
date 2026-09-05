Pure graph utilities work with application-owned `Node` and `Edge` collections. They read signals but do not mutate the collections or require a rendered flow.

## Topology

```ts
import { getConnectedEdges, getIncomers, getOutgoers } from 'ngx-vflow';

const connectedEdges = getConnectedEdges([selectedNode], edges);
const incomers = getIncomers(selectedNode, nodes, edges);
const outgoers = getOutgoers(selectedNode, nodes, edges);
```

Topology is node-level: `sourceHandle` and `targetHandle` do not affect these results. Connected edges preserve edge order and duplicates, while incoming and outgoing nodes are unique and retain node order. Edges with a missing opposite endpoint remain connected to the endpoint that exists.

## Bounds

```ts
import { getNodesBounds } from 'ngx-vflow';

const bounds = getNodesBounds(nodes);
```

Without a lookup, node points are used directly. Supply all nodes as lookup context when calculating flow-space bounds for a nested subset:

```ts
const nodeLookup = new Map(nodes.map((node) => [node.id, node]));
const selectedBounds = getNodesBounds(selectedNodes, { nodeLookup });
```

Only `selectedNodes` contribute rectangles to the result; lookup-only parents provide coordinate context. Missing dimensions have zero extent. Missing parents are treated as roots, and descendants are not included automatically.
