`ngx-vflow` makes a few decisions that shape every page of this documentation. This page explains them, so the
guides can stay short.

## The graph belongs to your application

A flow has no store. The `nodes` and `edges` inputs are arrays your application creates and keeps, and the flow
renders what they hold. It never adds or removes an element: when the user connects two handles or presses `Delete`,
the flow emits `(connect)` or `(deleteRequest)`, and your handler changes the arrays.

This keeps one source of truth. The graph can live in a component, a service or a signal store, be saved and
restored, and take part in undo and redo, without a second copy inside the library to keep in step. The price is a
few lines of code per event; the helpers in [Graph operations](/docs/graph/graph-operations) keep them short.

## Nodes and edges hold signals

A node is a plain object whose changeable properties are signals: `point`, `data`, `selected`, `width` and the
others. `createNodes()` builds such objects from plain values, and `toStaticNodes()` reads them back:

```ts
const nodes = createNodes([{ id: 'a', point: { x: 0, y: 0 }, data: { title: 'Draft' } }]);

nodes[0].point.set({ x: 120, y: 40 }); // moves the node
nodes[0].data.update((data) => ({ ...data, title: 'Review' })); // rerenders its presentation
```

Signals make a change local. Moving one node of a thousand notifies the views that read that one `point`, and the
array stays the same. A new array is needed only when the set of elements changes.

An edge keeps its endpoints, `source` and `target`, as plain fields: an edge is cheap to render anew, so
[reconnecting](/docs/handles/connections#reconnecting-edges) replaces the object.

## What the flow writes

Most signals of a `Node` are optional, and they are of three kinds:

- **The flow writes them**: `point`, `selected`, and `width` / `height` (only a resize gesture). With the signal in
  the node, the flow writes into it. Without `selected` or a size signal, the flow holds the value itself, and the
  [change](/docs/interactions/handling-changes) is the way to learn it.
- **The flow only reads them**: `draggable`, `extent`, `parentId`, `data`, `selectable`, `focusable`, `ariaLabel`,
  `ariaDescription`, `domAttributes`, `minimap`. A missing signal means the default or the setting of the flow.
- **`width` / `height` also choose the size mode**: an axis with the signal has a fixed size, an axis without it
  follows the content. See [Resizing](/docs/nodes/resizer).

Edges follow the same rule. The flow writes only `selected`; it only reads `curve`, `markers`, `reconnectable`,
`interactionWidth`, `data`, `selectable`, `focusable`, `ariaLabel`, `ariaDescription` and `domAttributes`.

The flow never adds signals to your node and edge objects. You can add one to an existing object later: assign it
and pass a new array, and the flow reads it without recreating the node or the edge. A signal of the application
wins over the value the flow held.

```ts
node.selected = signal(true);
this.nodes.update((nodes) => [...nodes]);
```

## Core is headless

Core owns geometry, gestures, selection, keyboard behavior and accessibility. It ships no node card, no edge line
and no handle dot: a node renders through your `vNode` template or component, an edge through your `vEdge` template
or component, and a handle is any element with `vHandle`.

The reason is that a node editor is part of a product, and its nodes are that product's forms, cards and charts. A
default look would be replaced in every real application, and inputs for colors and borders would only stand between
your CSS and the element. What core does draw is feedback that has no markup of yours to live in: the background
pattern, the selection box, resize controls, alignment guides, the connection preview and the focus ring.
[Tokens and attributes](/docs/reference/styling) lists them.

If you want a ready look, [@vflow/ui](/packages/ui/overview) is a set of parts copied into your workspace.

## How a flow is rendered

The flow renders coordinated HTML and SVG layers inside one transformed viewport:

- **HTML** holds nodes with their handles, toolbars and resize controls, and edge labels. Regular layout and CSS
  apply, so a node can contain a form or a chart.
- **SVG** holds edges and connection overlays. Each edge keeps its own SVG root, so the `z-index` values of edges and
  nodes can interleave.

Zooming and panning transform the shared viewport, which keeps both layers in the same coordinate system.

The `vflow` element is its own stacking context. The `z-index` of nodes, edges and the minimap orders them inside
the flow only, so dialogs, menus and other overlays of the application stay above the flow. To layer the flow as a
whole, set `z-index` on the `vflow` element or its container.

Documented Angular APIs, `data-v-*` attributes, tokens and observable behavior are supported contracts. The private
DOM structure and the nesting of the layers are implementation details and can change between releases.

## Flow space and client space

Positions come in two coordinate systems:

- **Flow space** is the coordinate system of the graph. `point` of a node, `snapGrid` and the rectangles returned by
  `getNodeRect()` are in flow units, which do not depend on pan and zoom. The `point` of a node with a `parentId` is
  relative to its parent.
- **Client space** is the browser viewport in CSS pixels, the system of `clientX` and `clientY` of pointer events.

The viewport, `{ x, y, zoom }`, maps one to the other. `clientToFlowPosition()` and `flowToClientPosition()` of the
flow convert a point, for example to place a node where something was dropped; see
[Geometry utilities](/docs/graph/geometry-utilities).

## The size of a node

By default a node is as large as its content, and the flow measures it. A `width` or a `height` fixes that axis
instead. [Node sizes](/docs/concepts/node-sizes) explains the two modes and why the size you ask for and the size
that is rendered are kept apart.
