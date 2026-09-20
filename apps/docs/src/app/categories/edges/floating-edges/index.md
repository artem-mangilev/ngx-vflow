A floating edge has no fixed port: it meets the node on the side that faces the other end, and moves to another side when the nodes move. In ngx-vflow this is a property of the handle, `position="auto"`: the node gets one handle whose connection point is resolved for every edge. With `handleType="any"` the same handle starts and accepts connections in both directions.

```html
<span vflowHandle handleType="any" position="auto"></span>
```

An edge can float on one end and use a port on the other: the port keeps its side, and the floating end faces the port. `position="center"` runs edges to the node center instead, for graphs whose nodes are drawn over their lines. See the Custom handles page for the details and the Easy connect recipe for a node that is a handle itself.

{{ NgDocActions.demoPane("FloatingEdgesDemoComponent") }}
