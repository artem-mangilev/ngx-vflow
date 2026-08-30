Structural graph operations work on application-owned collections without maintaining a store. Existing `NodeChange` and `EdgeChange` values are notifications that describe changes which already happened; they are not inputs to these helpers.

## Add and remove

```ts
import { addEdges, addNodes, createNodes, removeEdges, removeNodes } from 'ngx-vflow';

nodes = addNodes(createNodes(rawNodes), nodes);
edges = addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes, edges });

const removal = removeNodes(selectedNodeIds, { nodes, edges });
nodes = removal.nodes;
edges = removal.edges;

edges = removeEdges(selectedEdgeIds, edges);
```

`removeNodes` always includes descendants and incident edges. Its `removedNodes` and `removedEdges` fields contain the exact proposed cascade in original collection order. Missing removal IDs are no-ops.

`addEdges` requires existing endpoints, allows self-connections, and ignores an existing connection with the same source, target, and handle IDs. Handle IDs are preserved but their rendered existence is not validated by this pure helper.

## Reparent and reconnect

```ts
import { reconnectEdges, reparentNodes } from 'ngx-vflow';

nodes = reparentNodes([{ id: nodeId, parentId }], nodes);
edges = reconnectEdges([{ id: oldEdge.id, connection }], { nodes, edges });
```

Reparenting accepts any node type as a parent and preserves the moved node's flow-space position. It updates the existing `point` and `parentId` signals, creating only a missing optional `parentId` signal, keeps the node object reference stable, and returns a new node array after a successful operation. A full no-op returns the original array. Reconnection preserves the edge ID, array slot, metadata, and signal fields.

Operations in one call apply left-to-right. Invalid operations never throw: development builds warn and leave that operation unchanged. Application-specific validation, persistence, and history remain application concerns.
