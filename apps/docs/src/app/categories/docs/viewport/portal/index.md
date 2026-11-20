This guide shows how to put your own content on the canvas next to the graph: notes, regions behind a part of the
graph, decorations. Such content pans and zooms with the flow but is not a node or an edge. Its inputs and exact
behavior are in the [Viewport reference](/docs/reference/viewport#portal).

The lanes are drawn below the graph and the note above it. Drag “Payment”: the note follows it.

{{ NgDocActions.demoPane("PortalDemoComponent") }}

## Place content at a point of the flow

Put the structural `vPortal` directive on an element inside `<vflow>` and give it a flow-space point, the top-left corner of the content:

```html
<vflow [nodes]="nodes" [edges]="edges">
  <p *vPortal="{ x: 0, y: -60 }" class="note">Orders arrive here.</p>
</vflow>
```

The flow renders the element in a layer of its viewport, so it moves and scales with the nodes. The element keeps
the bindings and the styles of the place that declares it: the content of `<vflow>`, a component of yours inside it,
or a node component.

For several root elements, use the long form:

```html
<ng-template [vPortal]="point">
  <h3>Title</h3>
  <p>Text</p>
</ng-template>
```

## Draw below the graph

By default the content is above the nodes and edges. With `layer: 'below'` it is behind them, which suits regions
and backdrops:

{% raw %}

```html
<div *vPortal="lane.point; layer: 'below'" class="lane">{{ lane.title }}</div>
```

{% endraw %}

## Follow a node

The point is an ordinary binding, so it can come from a node. `getNodeRect()` reads the node's rectangle as a
signal and returns `undefined` until the node is measured; without a point nothing renders, so the content
appears in its place together with the node:

```ts
protected readonly notePoint = computed(() => {
  const rect = this.flow().getNodeRect('payment');
  return rect && { x: rect.x + rect.width + 16, y: rect.y - 44 };
});
```

```html
<p *vPortal="notePoint()">This note follows “Payment”.</p>
```

## What it takes part in

The content is not part of the graph. The alignment guides, the minimap, `fitView()`, `getNodesBounds()`, the
selection and keyboard navigation leave it out. Give `fitView()` enough `padding` if the content lies outside the
nodes.

The pointer goes through the content to the nodes and the pane under it, so a note never blocks a node. To make a
part of it interactive, give that part `pointer-events: auto`. A press on it then pans the viewport and a click
clears the selection, as on the pane; put a button or a field inside `vNoDrag`, see
[Gesture exclusions](/docs/reference/viewport#gesture-exclusions).

Content that users move, select or remove themselves is part of the graph: make it a node.
