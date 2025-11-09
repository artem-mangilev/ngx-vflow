# {{ NgDocPage.title }}

Edges can be reconnected. To reconnect an edge, follow these steps:

1. Mark the `Edge` object as `reconnectable`.
2. Create a handler for the `(reconnect)` event.
3. This handler accepts a `ReconnectionEvent` argument, which contains a new `Connection` and the `oldEdge` that you are trying to reconnect.
4. Update the `Edge[]` list with a new edge based on the `oldEdge` and the new `Connection`, then remove the reference to the old edge from the list.

{{ NgDocActions.demoPane("ReconnectionDemoComponent") }}
