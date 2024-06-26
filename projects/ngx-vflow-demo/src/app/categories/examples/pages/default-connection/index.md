# {{ NgDocPage.title }}

Edges are not creating automatically. To create a new edge, follow these steps:

1. Create handler to the `(onConnect)` event
2. This handler accepts a `Connection` argument. `Connection` is similar to an `Edge`, but it doesn't exists in the flow, you need to "convert" it into a new `Edge`
3. Update the `Edge[]` list with the new edge that was created from the `Connection`.

{{ NgDocActions.demo("DefaultConnectionDemoComponent", { expanded: true }) }}
