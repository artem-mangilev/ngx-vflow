This guide shows how to turn on viewport virtualization for a large graph and how to get the most from it. Nodes and
edges outside the viewport get `display: none`: their components stay mounted and keep their state, and only layout
and paint are saved, not memory.

The demo holds 10000 nodes in 100 rows and opens on the middle of the graph. Pan and zoom it: only the nodes and
edges in view are laid out and painted. Its `minZoom` keeps about a hundred nodes in view: virtualization saves the
work of what is hidden, so a view of the whole graph would be as slow as no virtualization at all.

{{ NgDocActions.demoPane("VirtualizationDemoComponent") }}

## Turn it on

Bind the input on the flow:

```html
<vflow [nodes]="nodes" [edges]="edges" [virtualization]="true" />
```

To turn it on for every flow of an application or a route, set `virtualization: true` in `withSettings()`.

## Decide whether you need it

Virtualization helps when most of the graph is outside the viewport most of the time. If the whole graph usually
fits in the view, everything visible is still drawn, and culling only adds work. The
[stress test](/examples/recipes/stress-test) renders 1024 nodes without it, so you can compare both on your device.

## Keep the visible nodes cheap to paint

Prefer borders or blur-free shadows for the resting state of a node, and keep `box-shadow` with a blur radius and
`filter` for hover and selection. Blurred effects dominate the cost of zooming and panning once the layout work is
gone.

## Keep sizes exact for hidden nodes

If the content of a node can change size while the node is offscreen and other code depends on that size, keep the
geometry in your own state. The library refreshes its measurement only when the node returns to the view.

## Do not combine it with viewport lazy loading

With virtualization on, nodes load at once whatever `lazyLoadTrigger` says, because every node is measured before
it can be hidden.

## Keep keyboard users in mind

Tab skips hidden nodes and edges. Leave virtualization off where every entity must be reachable by keyboard.
