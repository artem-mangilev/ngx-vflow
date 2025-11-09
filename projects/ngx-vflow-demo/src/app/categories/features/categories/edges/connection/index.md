# {{ NgDocPage.title }}

Edges are not creating automatically. To create a new edge, follow these steps:

1. Create handler to the `(connect)` event
2. This handler accepts a `Connection` argument. `Connection` is similar to an `Edge`, but it doesn't exists in the flow, you need to "convert" it into a new `Edge`
3. Update the `Edge[]` list with the new edge that was created from the `Connection`.

## Strict connections

In the default `'strict'` `mode` of `ConnectionSettings`, edges are created from connections with strict adherence to the `source` and `target` types of the `HandleComponent`. This means connections can only be established in one direction based on these properties.

{{ NgDocActions.demoPane("DefaultConnectionDemoComponent") }}

## Loose connections

This is the `'loose'` `mode` of `ConnectionSettings`, where the flow ignores the handle `type` and allows any handle to connect with any other handle. In this mode, an `id` must be provided for the `HandleComponent` to function correctly.

{{ NgDocActions.demoPane("LooseConnectionDemoComponent") }}
