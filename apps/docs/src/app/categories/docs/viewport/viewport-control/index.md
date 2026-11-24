The viewport is the part of the graph the flow shows: an offset and a zoom. Users change it with
[gestures](/docs/viewport/viewport-gestures); this page is about changing and reading it from code, for buttons of
your own, a "go to node" search or a saved view. The methods and their options are listed at the end of this page.

{{ NgDocActions.demoPane("ViewportControlDemoComponent") }}

## Get the flow

The methods belong to `VflowComponent`. Reach it through a template reference or a view query:

```html
<vflow #flow [nodes]="nodes" [edges]="edges" /> <button type="button" (click)="flow.fitView()">Fit view</button>
```

```ts
private readonly flow = viewChild.required(VflowComponent);
```

A component of your own placed inside `vflow`, such as a toolbar of viewport buttons, injects the flow it is in. The
flow renders such an element above the pane, in a layer the size of the flow: place it with
[`vPanel`](/docs/viewport/panel) or with your own CSS. The pointer still reaches the pane around it. [`vui-controls`](/packages/ui/overview#viewport-controls) of `@vflow/ui` works this
way.

```ts
@Component({
  selector: 'app-zoom-bar',
  template: `<button type="button" (click)="flow.zoomIn()">Zoom in</button>`,
})
export class ZoomBarComponent {
  protected readonly flow = inject(VflowComponent);
}
```

```html
<vflow [nodes]="nodes" [edges]="edges">
  <!-- node and edge templates -->
  <app-zoom-bar vPanel="top-right" />
</vflow>
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

## Wait for a change to finish

Every viewport method returns a promise that settles when the change ends, with `true` when the viewport reached
its target. Await it to run the next step of a tour or to chain animations:

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

## Call a method from an effect

The viewport methods read no signal in a tracked way, so an effect may call them without `untracked`. If the effect
also reads a query such as `getNodesBounds()` or `getNodeRect()`, it reruns on every node move; read the query in
`untracked` when it must not.

## Methods

| Method                                  | Effect                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fitView(options?)`                     | Fits the given nodes, or all of them, into the flow                                      |
| `setCenter(point, options?)`            | Puts a flow-space point in the center of the flow, at `options.zoom` or the current zoom |
| `setViewport(viewport, options?)`       | Sets `x`, `y` and `zoom`                                                                 |
| `zoomTo(zoom, options?)`                | Zooms around the center of the flow                                                      |
| `zoomIn(options?)`, `zoomOut(options?)` | Zoom around the center by the step of the zoom keys, `1.2`                               |

Every method takes `duration`, the length of the animated transition in milliseconds; `0`, the default, changes the
viewport at once. `fitView()` also takes:

| Option               | Meaning                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `nodes`              | Ids of the nodes to fit; all nodes when omitted or empty                  |
| `padding`            | Space around the fitted nodes, as a share of their size; `0.1` by default |
| `minZoom`, `maxZoom` | Limits for this fit, within the `minZoom` and `maxZoom` of the flow       |

- Zoom is clamped to the `minZoom` and `maxZoom` of the flow; `x` and `y` stay as given.
- Methods apply at once and in order, each from where the previous one leads.
- Each returns a promise that settles when the change ends: `true` when the viewport reached the target, `false`
  when there was nothing to change or another change or a gesture interrupted it first.
- The methods read no signal in a tracked way, so an effect may call them without `untracked`.

Queries such as `getNodesBounds()`, `getNodeRect()` and `getNodesAtPoint()` are signal reads:
`computed(() => flow.getNodesBounds())` follows the nodes, and an effect that reads a query reruns when its answer
may change.

## Signals and events

| Member                                     | Description                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `viewport`                                 | Signal of `{ x, y, zoom }`; follows every frame of a gesture or an animation                                                                                                                      |
| `settings.minZoom()`, `settings.maxZoom()` | The resolved zoom limits                                                                                                                                                                          |
| `(initialized)`                            | Emitted once, when the first layout is complete: the flow has a size, and every node has its size and handle positions. An empty graph completes it too. A later subscription does not receive it |
| `(viewportChangeEnd)`                      | Emits the viewport when a change ends: a drag or a touch gesture is released, a double-click zoom lands, a series of wheel events stops for 150 ms, a programmatic call lands or is interrupted   |
