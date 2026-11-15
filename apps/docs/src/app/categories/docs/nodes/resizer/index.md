This guide shows how to let users resize nodes and groups, limit the result and keep it in your data. For the
model behind it, see [Node sizes](/docs/concepts/node-sizes).

## Make a node resizable

Put the `vResizable` directive on the top-level element of the node presentation, without outer margins. It works in
a `vNode` template and in a component node.

{% raw %}

```html
<div *vNode="let ctx" vResizable class="card">{{ ctx.data().title }}</div>
```

{% endraw %}

- If the node has no `width` and `height`, it starts content-sized. A resize fixes the axes the dragged control
  drives: a corner both, a side one.
- If you want it to start with a fixed size, give the node `width`, `height` or both. A resize writes the new size
  into those signals.

Do not bind `[style.width.px]` or `[style.height.px]` yourself: the directive sets the size on its element. Size a
content-sized node with regular CSS, for example `width: 240px`, and avoid `width: 100%` and `height: 100%`.

In the example the first card has no size in its data and the second one starts with `width` and `height`. Each
shows its rendered size, and neither gets smaller than the `min-width` and `min-height` of its CSS.

{{ NgDocActions.demoPane("TemplateNodeResizerDemoComponent") }}

## Resize a group

Create the node with `width` and `height`, so both axes of the group start fixed, and put `vResizable` on the element
that draws the group.

If other elements depend on the size of the group, read the rendered size from `ctx.width()` and `ctx.height()`, not
from `ctx.node.width` and `ctx.node.height`, which hold the requested size.

{{ NgDocActions.demoPane("GroupResizerDemoComponent") }}

## Show the controls only on a selected node

Bind the directive to a condition. With `false` the controls are hidden and the element stays the sizing box of the
node:

```html
<div *vNode="let ctx" class="card" [vResizable]="ctx.selected()">…</div>
```

## Limit the size

Set `min-width`, `min-height`, `max-width` or `max-height` in the CSS of the element; the resizer stops there. If the
limits come from data, bind the `[minWidth]`, `[minHeight]`, `[maxWidth]` and `[maxHeight]` inputs instead; they win
over the CSS.

## Keep the proportions or resize one axis

- To keep the aspect ratio, set `[keepAspectRatio]="true"`.
- To resize only the width or only the height, set `resizeAxis` to `horizontal` or `vertical`.

## Refuse a step

Give `[shouldResize]` a function. It receives the `ResizeEvent` of a step before the step is applied; return `false`
to skip it:

```ts
protected readonly notTooWide: ShouldResize = (event) => event.width <= 600;
```

## React to the gesture

Bind `(resizeStart)`, `(resize)` and `(resizeEnd)` on the `vResizable` element, for example to show the size while
the user drags:

```html
<div *vNode="let ctx" vResizable (resize)="hint.set($event.width + ' × ' + $event.height)" (resizeEnd)="hint.set('')">…</div>
```

## Save the size a user set

`(nodesChanges.size)` on `vflow` reports every change of the rendered size with the `mode` of each axis.

- If the node has `width` and `height` signals, the resizer has already written the new size into them. Nothing
  else is needed.
- If the node has none, the flow holds the resized size itself. To keep it in the node, add the signal and pass a
  new array; the node keeps its view, and the resizer writes into the signal from then on:

```ts
protected keepResizedSize(changes: NodeSizeChange[]) {
  let added = false;

  for (const { id, size, mode } of changes) {
    const node = this.nodes().find((node) => node.id === id);
    if (!node) continue;

    if (mode.width === 'explicit' && !node.width) {
      node.width = signal(size.width);
      added = true;
    }
    if (mode.height === 'explicit' && !node.height) {
      node.height = signal(size.height);
      added = true;
    }
  }

  // The flow reads a signal added to a node once it receives a new array.
  if (added) this.nodes.update((nodes) => [...nodes]);
}
```

Persist an axis only when its mode is `explicit`. An `auto` axis is a measurement of the content of the node.

## Restyle the controls

Set the `--v-resize-control` and `--v-resize-control-border` tokens for the colors, and select the controls by the
`data-v-resize-control` attribute for size and shape. See the [Resizer reference](/docs/reference/resizer#appearance).

## See also

- [Resizer reference](/docs/reference/resizer)
- [Subflows](/docs/nodes/subflows)
- [Handling changes](/docs/interactions/handling-changes)
