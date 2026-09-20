Nodes without ports: a connection starts anywhere on a node and ends anywhere on another one, and edges meet the nodes on the side facing the other node, or at the center. The node title drags the node.

{{ NgDocActions.demoPane("EasyConnectDemoComponent") }}

## The node is the handle

The root element of the node presentation carries `vflowHandle` with `handleType="any"`, so the whole card starts and accepts connections in either direction, and `position="auto"`, so every edge meets the node on the side that faces the other end. Dragging the node needs its own surface: an element with `dragHandle` inside the handle keeps dragging the node, and everywhere else a press starts a connection.

{% raw %}

```html
<div class="easy-node" vflowHandle handleType="any" position="auto">
  <div class="easy-node__title" dragHandle>{{ ctx.data().title }}</div>
  <div class="easy-node__body">Drag from here to connect</div>
</div>
```

{% endraw %}

While a connection is in progress the handle element itself is the drop zone: the node under the pointer becomes the candidate, and the node the connection started from carries `data-vflow-handle-state="connecting"`. Plain CSS styles both. No connection settings are needed beyond the marker of the preview line.

## Border or center

`position="auto"` takes the middle of the side facing the other node, which works with every built-in curve, including the stepped ones, and keeps arrow markers visible. `position="center"` runs edges to the node center, the look of force-directed graphs; the edge layer lies under the nodes, so markers are hidden there. The demo switches between both.

For endpoints on the exact crossing of the line between the node centers, or for nodes of other shapes, write a custom curve: every curve factory receives `sourceNode`, `targetNode` and `markerInset`, and `getFloatingEdgeParams` computes the crossing for rectangles.
