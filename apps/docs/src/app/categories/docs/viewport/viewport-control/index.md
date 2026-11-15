The viewport is the part of the graph the flow shows: an offset and a zoom. Users change it with
[gestures](/docs/viewport/viewport-gestures); this page is about changing and reading it from code, for buttons of
your own, a "go to node" search or a saved view.

{{ NgDocActions.demoPane("ViewportControlDemoComponent") }}

## Get the flow

The methods belong to `VflowComponent`. Reach it through a template reference or a view query:

```html
<vflow #flow [nodes]="nodes" [edges]="edges" /> <button type="button" (click)="flow.fitView()">Fit view</button>
```

```ts
private readonly flow = viewChild.required(VflowComponent);
```

## Fit the graph on load

`(initialized)` is emitted once, when the first layout is complete: the flow has a size, and every node has its size
and handle positions. The graph is not painted before that, so a viewport set in the handler is the first one the
user sees:

```html
<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView()" />
```

An empty graph completes the first layout too; fit nodes that load later when they arrive. A subscription made after
the emission does not receive it, so code that asks later whether the flow is ready keeps a flag:
`(initialized)="ready.set(true)"`.

## Show a node

To bring one node or a few into view, pass their ids to `fitView()`. To center on a point of the graph without
changing the zoom, use `setCenter()` with a rectangle from `getNodeRect()`:

```ts
this.flow().fitView({ nodes: ['invoice-42'], padding: 0.5, duration: 300 });

const rect = this.flow().getNodeRect('invoice-42');
if (rect) {
  this.flow().setCenter({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, { duration: 300 });
}
```

## Save and restore the viewport

`(viewportChangeEnd)` emits the viewport when a change ends: a drag or a touch gesture is released, a double-click
zoom lands, a series of wheel events stops for 150 ms, a programmatic call lands or is interrupted. That is the
moment to save it; `setViewport()` restores it:

```html
<vflow #flow [nodes]="nodes" (viewportChangeEnd)="saved.set($event)" (initialized)="restore(flow)" />
```

```ts
protected restore(flow: VflowComponent): void {
  const viewport = this.saved();

  if (viewport) {
    flow.setViewport(viewport);
  } else {
    flow.fitView();
  }
}
```

## Methods

| Method                                  | Effect                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fitView(options?)`                     | Fits the given nodes, or all of them, into the flow                                      |
| `setCenter(point, options?)`            | Puts a flow-space point in the center of the flow, at `options.zoom` or the current zoom |
| `setViewport(viewport, options?)`       | Sets `x`, `y` and `zoom`. To pan without zooming, pass `{ ...flow.viewport(), x, y }`    |
| `zoomTo(zoom, options?)`                | Zooms around the center of the flow                                                      |
| `zoomIn(options?)`, `zoomOut(options?)` | Zoom around the center by the step of the zoom keys, `1.2`                               |

Every method takes `duration`, the length of the animated transition in milliseconds; `0`, the default, changes the
viewport at once. `fitView()` also takes:

| Option               | Meaning                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `nodes`              | Ids of the nodes to fit; all nodes when omitted or empty                  |
| `padding`            | Space around the fitted nodes, as a share of their size; `0.1` by default |
| `minZoom`, `maxZoom` | Limits for this fit, within the `minZoom` and `maxZoom` of the flow       |

Zoom always keeps to the `minZoom` and `maxZoom` of the flow; `x` and `y` stay as given.

## Calls compose

Viewport methods apply at once and in order, each from where the previous one leads, so consecutive calls compose.
Each returns a promise that settles when the change ends: `true` when the viewport reached the target, `false` when
there was nothing to change or another change or a gesture interrupted it first.

```ts
if (await this.flow().fitView({ duration: 300 })) {
  this.tour.next();
}
```

## Read the viewport

The `viewport` signal of the flow holds the current `{ x, y, zoom }` and follows every frame of a gesture or an
animation. Read it in a template, a `computed` or an effect:

{% raw %}

```html
<output>{{ (flow.viewport().zoom * 100).toFixed(0) }}%</output>
```

{% endraw %}

The resolved limits are signals too: `flow.settings.minZoom()` and `flow.settings.maxZoom()`.

## Effects and queries

The viewport methods read no signal in a tracked way, so an effect may call them without `untracked`. Queries such
as `getNodesBounds()`, `getNodeRect()` and `getNodesAtPoint()` are signal reads: `computed(() =>
flow.getNodesBounds())` follows the nodes, and an effect that reads a query reruns when its answer may change. Read
the query in `untracked` when the effect must not repeat on every node move.
