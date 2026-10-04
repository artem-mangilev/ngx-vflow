You might want to resize your node. The resizer is part of core's interaction feedback and works with template and component nodes, including groups.

## Node size modes

Each axis of a node has its own size mode:

- `auto` — the axis follows the content. The library measures the rendered node and writes no inline size for this axis. This is the default for an axis without its `width` / `height` signal in the node data.
- `explicit` — the axis has a fixed size that the library renders inline. An axis is explicit when the node data carries its signal, or after a resize gesture changes it. Content larger than an explicit size does not grow the node.

The axes are independent: a node with only `width` has a fixed width and a height that follows its content.

The `width` / `height` signals of a node hold the size your application asks for. Only a resize gesture writes them; measurement never does. A gesture on a node without the signal keeps the size inside the flow. The rendered size, which edges, handles and bounds use, is the measured box: it equals the explicit size unless CSS `min-*` / `max-*` on the element clamps it. Read it with `ctx.width()` / `ctx.height()` in the presentation, or with `getNodeRect(id)` / `getNodesBounds(ids?)` on the `<vflow />` component.

## Where the size is applied

The element with the `vResizable` directive is the node's sizing box:

- Put `vResizable` on the top-level element of the node template, without outer margins. Resize controls and handles are both positioned relative to the node box, so the controls stay visible around a card with `overflow: hidden`.
- For each `explicit` axis the library sets `width` or `height` inline on that element, plus `box-sizing: border-box` while any axis is explicit, so padding and border stay inside the size you drag to. With border-box, CSS `min-*` / `max-*` of an `auto` axis also apply to the border box. You don't need to bind `[style.width.px]` / `[style.height.px]` yourself.
- The resizer respects the element's `min-width` / `min-height` / `max-width` / `max-height` CSS, or explicit `[minWidth]` / `[minHeight]` / `[maxWidth]` / `[maxHeight]` inputs.
- Size the element for `auto` mode with regular CSS, for example `width: 240px`. Avoid `width: 100%` / `height: 100%`: they resolve against the content-sized node wrapper.
- `[vResizable]="false"` hides the controls but keeps the element as the sizing box, so you can bind the controls to the selection state.

## Resize a group

- Create a node with `width` and `height`, so both axes of the group start `explicit`, and mark it in `data` to draw it as a group in the `vNode` template.
- Add `vResizable` (or `[vResizable]="yourCondition"`) to the native HTML element representing your group. The library applies the group size to that element.
- If other elements depend on the group size, read the rendered size from `ctx.width()` and `ctx.height()`, not `ctx.node.width` and `ctx.node.height`: the latter hold the requested size.
- Optionally, keep the aspect ratio with `[keepAspectRatio]`, restrict resizing to one axis with `[resizeDirection]` (`horizontal` | `vertical`), toggle handle auto-scaling with `[autoScale]`, and react to `(resizeStart)` / `(resizeChange)` / `(resizeEnd)`.

{{ NgDocActions.demoPane("GroupResizerDemoComponent") }}

## Resize a template/component regular node

- Create a node rendered by the `vNode` template or by a `component`.
  - Leave out `width` / `height` to start content-sized. A resize makes explicit the axes the control drives: a corner both, a side one. With `[resizeDirection]`, only that axis.
  - Provide `width` and / or `height` to start with a fixed size on those axes. A resize writes the new size into these signals.
- Add `vResizable` (or `[vResizable]="yourCondition"`) to the top-level element of your node.
- The same options and events as for groups are available.

{{ NgDocActions.demoPane("TemplateNodeResizerDemoComponent") }}

## Resizer appearance

The resize controls take their colors from the core tokens `--v-selection` and `--v-surface`; the `.v-resize-control` class (with `.v-resize-control--handle` / `.v-resize-control--line` modifiers) is the public selector for size and shape overrides.

## Resize event

`(nodesChanges.size)` on the `<vflow />` component reports every change of the rendered size with the `mode` of each axis, `{ width, height }`:

- Persist an axis only when its mode is `explicit`. An `auto` axis is a measurement of the node's content; writing it back as `width` / `height` would stop the node from following its content.
- When the node data has the signal, the resizer has already written the new size into it.
- When it has none, the flow holds the resized size itself and never adds signals to your node. To keep the size in the node data, add the signal and pass a new array; the node keeps its view, and the resizer writes into the signal from then on:

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

- To react to the gesture itself, use `(resizeStart)` / `(resizeChange)` / `(resizeEnd)` on the `vResizable` element.

## See also

- `*FeaturesSubflows`
- `*FeaturesCustomNodes`
- `*FeaturesHandlingChanges`
