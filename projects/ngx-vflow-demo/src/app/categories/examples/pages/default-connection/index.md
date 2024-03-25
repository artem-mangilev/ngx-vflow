# {{ NgDocPage.title }}

Edges are not creating automatically. Basically, these steps needs to be performed to create new edge:

1. Create handler to `(onConnect)` event
2. This handler accepts `Connection` argument. `Connection` is like `Edge`, but it doesn't exists in flow, you need to "convert" it to new `Edge`
3. `Edge[]` list updated with new edge that was created from `Connection`

{{ NgDocActions.demo("DefaultConnectionDemoComponent", { expanded: true }) }}
