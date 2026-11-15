The viewport is the part of the graph the flow shows: an offset and a zoom. Users change it with
[gestures](/docs/viewport/viewport-gestures); this page is about changing and reading it from code, for buttons of
your own, a "go to node" search or a saved view. The methods and their options are listed in the
[Viewport reference](/docs/reference/viewport#methods).

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
flow renders such an element above the pane, in a layer the size of the flow, so position it with CSS; the pointer
still reaches the pane around it. [`vui-controls`](/packages/ui/overview#viewport-controls) of `@vflow/ui` works this
way.

```ts
@Component({
  selector: 'app-zoom-bar',
  template: `<button type="button" (click)="flow.zoomIn()">Zoom in</button>`,
  host: { class: 'absolute top-2 right-2' },
})
export class ZoomBarComponent {
  protected readonly flow = inject(VflowComponent);
}
```

```html
<vflow [nodes]="nodes" [edges]="edges">
  <!-- node and edge templates -->
  <app-zoom-bar />
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

## See also

- [Viewport reference](/docs/reference/viewport#methods) for every method, option and event.
