Nodes without ports: a connection starts anywhere on a node and ends anywhere on another one, and edges leave and enter nodes through their borders wherever the other node is. The node title drags the node.

{{ NgDocActions.demoPane("EasyConnectDemoComponent") }}

## The node is the handle

The root element of the node presentation carries `vflowHandle` with `layout="manual"`, so the directive writes no styles and the whole card starts connections. Dragging the node needs its own surface: an element with `dragHandle` inside the handle keeps dragging the node, and everywhere else a press starts a connection. The `id` is the node id, because the `loose` connection mode needs a handle id on both ends.

{% raw %}

```html
<div class="easy-node" vflowHandle handleType="source" layout="manual" [id]="ctx.node.id">
  <div class="easy-node__title" dragHandle>{{ ctx.data().title }}</div>
  <div class="easy-node__body">Drag from here to connect</div>
</div>
```

{% endraw %}

While a connection is in progress the handle element itself is a drop zone: the node under the pointer becomes the candidate, and the node the connection started from carries `data-vflow-handle-state="connecting"`. Plain CSS styles both.

## Edges through the borders

A handle has a fixed side, so an edge between whole-node handles would always leave through the same border. A custom curve computes its own endpoints instead: `getFloatingEdgeParams` takes the geometry of both nodes, which every curve factory receives as `sourceNode` and `targetNode`, and returns the points where the segment between the node centers crosses the borders, with the sides for the bezier control points. `markerInset` keeps the arrow tip on the border.

```ts
const floatingCurve: CurveFactory = (params) => {
  if (params.targetNode) {
    return getBezierPath(getFloatingEdgeParams(params.sourceNode, params.targetNode, { inset: params.markerInset }));
  }

  // The connection preview follows the pointer, which is already moved by the marker inset.
  const pointer = { ...params.targetPoint, width: 0, height: 0 };

  return getBezierPath(getFloatingEdgeParams(params.sourceNode, pointer, { inset: { start: params.markerInset.start } }));
};
```

The same factory serves the edges, through `curve` of each edge, and the connection preview, through `curve` of `ConnectionSettings`. Nodes of other shapes need their own border function; the utility handles rectangles.

## Settings

```ts
connection: ConnectionSettings = { mode: 'loose', curve: floatingCurve, marker: { type: 'arrow-closed' } };
```

With one handle per node there is one edge per pair of nodes and no distinct ports; use handles with `position` for typed inputs and outputs.
