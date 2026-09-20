Edges are not created automatically. To create a new edge, follow these steps:

1. Create a handler for the `(connect)` event
2. This handler accepts a `Connection` argument. `Connection` is similar to an `Edge`, but it doesn't exist in the flow yet—you need to "convert" it into a new `Edge`
3. Give the edge an ID and pass it to `addEdges` with the application-owned collections

## Typed handles

Edges run from a `source` handle to a `target` handle: a connection dragged the other way round is reversed, and two handles of the same type do not connect.

{{ NgDocActions.demoPane("DefaultConnectionDemoComponent") }}

## Handles of type `any`

A handle with `handleType="any"` connects to any other handle in either direction, and the edge keeps the direction of the gesture. Give such handles a `handleId` when a node has several, so that the edge refers to the right one.

{{ NgDocActions.demoPane("LooseConnectionDemoComponent") }}

## Connection validation

`ngx-vflow` supports real-time synchronous validation of connections. Validation occurs when a user attempts to create a new edge. By default, every connection is valid, but you can provide a `ConnectionSettings` with a `validator` callback where you specify the validation logic.

For example, in this case, validation only passes connections from node 1 to node 2. If the `validator` returns `false`, the `(connect)` event won't be triggered because there is no valid connection.

{{ NgDocActions.demoPane("ConnectionValidationDemoComponent") }}

## Reconnecting edges

Edges can be reconnected. To reconnect an edge, follow these steps:

1. Mark the `Edge` object as `reconnectable`
2. Create a handler for the `(reconnect)` event
3. This handler accepts a `ReconnectionEvent` argument, which contains a new `Connection` and the `oldEdge` that you are trying to reconnect
4. Pass the old edge ID and new `Connection` to `reconnectEdges`

{{ NgDocActions.demoPane("ReconnectionDemoComponent") }}
