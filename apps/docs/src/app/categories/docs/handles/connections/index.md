Edges are not created automatically. To create a new edge, follow these steps:

1. Create a handler for the `(connect)` event
2. This handler accepts a `Connection` argument. `Connection` is similar to an `Edge`, but it doesn't exist in the flow yet—you need to "convert" it into a new `Edge`
3. Give the edge an ID and pass it to `addEdges` with the application-owned collections

The connection gesture does not depend on the handler: a handle starts a connection whether or not `(connect)` or any other connection output is bound, and without a handler the gesture ends with no new edge. To stop a handle from starting or accepting connections, set its `canStart` or `canAccept` input to `false`.

`(connectEnd)` reports how the gesture ended. Its `to` is the handle under the pointer, or `null` when the
connection was released over the canvas. Its `point` is where the pointer was released, in flow space: the place for
a node that such a release creates.

## Typed handles

Edges run from a `source` handle to a `target` handle: a connection dragged the other way round is reversed, and two handles of the same type do not connect.

In the demo the right port of a node is its `source` handle and the left port its `target` handle. Connect the
right port of `Sender` and the left port of `Receiver`: whichever of the two you start from, the arrow of the new
edge points at `Receiver`.

{{ NgDocActions.demoPane("DefaultConnectionDemoComponent") }}

## Handles of type `any`

A handle with `handleType="any"` connects to any other handle in either direction, and the edge keeps the direction of the gesture. Give such handles a `handleId` when a node has several, so that the edge refers to the right one.

Every port of the demo is of type `any`: the arrow of a new edge points from the port where the drag started to the
port where it ended.

{{ NgDocActions.demoPane("LooseConnectionDemoComponent") }}

## Connection validation

`ngx-vflow` supports real-time synchronous validation of connections. Validation occurs when a user attempts to create a new edge. By default the gesture rejects two handles of the same type, a connection from a node to itself, and a connection between handles that an edge already connects. `ConnectionSettings` lifts the last two with `allowSelfConnections` and `allowDuplicateConnections`, and adds your own rule with a `validator` callback.

A reconnected edge is not a duplicate of itself, so it can be dropped back on the handle it came from. `addEdges` accepts self-connections and duplicates: the rules belong to the gesture, not to the graph.

The `validator` receives both ends of the connection, `source` and `target`. Each end is `{ node, handle }`: your node object, and the `id`, `type` and `position` of the handle. A rule reads the data of a node from the end, without looking the node up by its id. The ends are in the roles they would have in the edge, whichever handle the drag started from. To read your own node data, give the settings your node type, as in `ConnectionSettings<NodeWithDefaults<MyData>>`.

The `validator` also runs while the end of an edge is dragged to another handle. The connection it receives then carries that edge as `reconnectedEdge`. If your rule counts edges, for example "a handle accepts one edge", leave this edge out of the count: the connection replaces it.

```ts
const connection: ConnectionSettings = {
  validator: ({ target, reconnectedEdge }) => !edges().some((edge) => edge.target === target.node.id && edge.id !== reconnectedEdge?.id),
};
```

The `validator` of the demo passes a connection only when both of its ends carry the same type of value: `Text out` connects to `Text in`, and `Number out` to `Number in`. A handle under a rejected connection turns red. If the `validator` returns `false`, the `(connect)` event won't be triggered because there is no valid connection.

{{ NgDocActions.demoPane("ConnectionValidationDemoComponent") }}

## Reconnecting edges

Edges can be reconnected. To reconnect an edge, follow these steps:

1. Mark the `Edge` object as `reconnectable`
2. Create a handler for the `(reconnect)` event
3. This handler accepts a `ReconnectEvent` argument, which contains the `edge` you are reconnecting and its new `Connection`
4. Pass the event to `reconnectEdges`: `edges = reconnectEdges([event], { nodes, edges })`

`reconnectable` is `true` for both ends of an edge, or `'source'` or `'target'` for one of them; the edges of the
demo are labeled with the ends that can be dragged.

`(reconnectEnd)` reports where the dragged end was released. Its `to` is the handle under the pointer, or `null`
when there is none; the demo removes an edge whose end is released over the canvas.

{{ NgDocActions.demoPane("ReconnectionDemoComponent") }}
