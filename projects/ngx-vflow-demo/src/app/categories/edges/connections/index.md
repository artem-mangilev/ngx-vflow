Edges are not created automatically. To create a new edge, follow these steps:

1. Create a handler for the `(connect)` event
2. This handler accepts a `Connection` argument. `Connection` is similar to an `Edge`, but it doesn't exist in the flow yet—you need to "convert" it into a new `Edge`
3. Update the `Edge[]` list with the new edge that was created from the `Connection`

## Strict connections

In the default `'strict'` `mode` of `ConnectionSettings`, edges are created from connections with strict adherence to the `source` and `target` types of the `HandleComponent`. This means connections can only be established in one direction based on these properties.

{{ NgDocActions.demoPane("DefaultConnectionDemoComponent") }}

## Loose connections

This is the `'loose'` `mode` of `ConnectionSettings`, where the flow ignores the handle `type` and allows any handle to connect with any other handle. In this mode, an `id` must be provided for the `HandleComponent` to function correctly.

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
4. Update the `Edge[]` list with a new edge based on the `oldEdge` and the new `Connection`, then remove the reference to the old edge from the list

{{ NgDocActions.demoPane("ReconnectionDemoComponent") }}
