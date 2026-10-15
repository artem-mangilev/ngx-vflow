Structural graph operations work on application-owned collections without maintaining a store. Existing `NodeChange` and `EdgeChange` values are notifications that describe changes which already happened; they are not inputs to these helpers.

Each helper takes what it reads and returns what it writes. A helper that changes one collection returns that array, so it fits `signal.update()`; `removeElements` changes both and returns both.

## Add and remove

```ts
import { addEdges, addNodes, createNodes, removeEdges, removeElements } from 'ngx-vflow';

nodes = addNodes(createNodes(rawNodes), nodes);
edges = addEdges([{ id: crypto.randomUUID(), ...connection }], { nodes, edges });
edgesSignal.update((edges) => addEdges([edge], { nodes, edges }));

const removal = removeElements({ nodeIds, edgeIds }, { nodes, edges });
nodes = removal.nodes;
edges = removal.edges;

edges = removeEdges(selectedEdgeIds, edges);
```

`removeElements` takes the same shape as `(deleteRequest)`, so `removeElements(request, { nodes, edges })` applies a request. Node removal always includes descendants and incident edges. Its `removedNodes` and `removedEdges` fields contain the exact removed elements in original collection order. Missing removal IDs are no-ops.

`addEdges` requires a unique ID and existing endpoints. It accepts self-connections and connections between handles that another edge already connects: whether those are allowed is a rule of the connection gesture, see `allowSelfConnections` and `allowDuplicateConnections` in `ConnectionSettings`. The edge ID is the application's choice. Handle IDs are preserved but their rendered existence is not validated by this pure helper.

## Reparent and reconnect

```ts
import { reconnectEdges, reparentNodes } from 'ngx-vflow';

nodes = reparentNodes([{ id: nodeId, parentId }], nodes);
edges = reconnectEdges([event], { nodes, edges });
```

A reconnect operation is `{ edge: { id }, connection }`, the shape of the `(reconnect)` event.

Reparenting accepts any node type as a parent and preserves the moved node's flow-space position. It updates the existing `point` and `parentId` signals, creating only a missing optional `parentId` signal, keeps the node object reference stable, and returns a new node array after a successful operation. A full no-op returns the original array.

Reconnection replaces the edge object: the endpoints of an edge are plain fields, not signals, so the flow renders the reconnected edge anew. The new object keeps the edge ID, array slot, metadata, and signal fields. A node keeps its structure in signals because rendering it anew is expensive; an edge is cheap and stays immutable.

Operations in one call apply left-to-right. Invalid operations never throw: development builds warn and leave that operation unchanged. Application-specific validation, persistence, and history remain application concerns.
