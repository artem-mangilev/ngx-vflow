You might want to resize your node. The resizer is part of core's interaction feedback and works with template groups and template/component nodes.

## Node size modes

Every node has a size mode:

- `auto` — the node follows its content. The library measures the rendered node and never writes inline dimensions. This is the default for `html-template` and component nodes without `width` / `height` in their data.
- `explicit` — the node has a fixed size that the library renders. A node is explicit when its data carries both `width` and `height`, when it is a `template-group`, or after the first resize gesture turns an `auto` node into an explicit one. A click on a resize control without movement doesn't change the mode.

## Where the size is applied

The element with the `resizable` directive is the node's sizing box:

- Put `resizable` on the top-level element of the node template, without outer margins. Resize controls and handles are both positioned relative to the node box, so the controls stay visible around a card with `overflow: hidden`.
- In `explicit` mode the library sets `width`, `height` and `box-sizing: border-box` inline on that element, so padding and border stay inside the size you drag to. You don't need to bind `[style.width.px]` / `[style.height.px]` yourself.
- The resizer respects the element's `min-width` / `min-height` / `max-width` / `max-height` CSS, or explicit `[minWidth]` / `[minHeight]` / `[maxWidth]` / `[maxHeight]` inputs.
- Size the element for `auto` mode with regular CSS, for example `width: 240px`. Avoid `width: 100%` / `height: 100%`: they resolve against the content-sized node wrapper.
- `[resizable]="false"` hides the controls but keeps the element as the sizing box, so you can bind the controls to the selection state.

## Resize template group

- Create a `template-group` node. Its `width` and `height` are required, so the group is always `explicit`.
- Add `resizable` (or `[resizable]="yourCondition"`) to the native HTML element representing your group. The library applies the group size to that element.
- If other elements depend on the group size, read `ctx.width()` and `ctx.height()` from the context, not `ctx.node.width` and `ctx.node.height`: the latter are not reactive.
- Optionally, keep the aspect ratio with `[keepAspectRatio]`, restrict resizing to one axis with `[resizeDirection]` (`horizontal` | `vertical`), toggle handle auto-scaling with `[autoScale]`, and react to `(resizeStart)` / `(resizeChange)` / `(resizeEnd)`.

{{ NgDocActions.demoPane("TemplateGroupResizerDemoComponent") }}

## Resize a template/component regular node

- Create a node of type `html-template` or `CustomNodeComponent` (`CustomDynamicNodeComponent`).
  - Leave out `width` / `height` to start content-sized; the first resize makes the node explicit.
  - Provide both `width` and `height` to start with a fixed size.
- Add `resizable` (or `[resizable]="yourCondition"`) to the top-level element of your node.
- The same options and events as for groups are available.

{{ NgDocActions.demoPane("TemplateNodeResizerDemoComponent") }}

## Resizer appearance

The resize controls take their colors from the core tokens `--vflow-selection` and `--vflow-surface`; the `.resize-control` class (with `.handle` / `.line` variants) is the public selector for size and shape overrides.

## Resize event

`(nodesChanges.size)` on the `<vflow />` component reports every size change with a `mode`:

- Persist the size only when `mode` is `explicit`. An `auto` size is a measurement of the node's content; writing it back as `width` / `height` would stop the node from following its content.
- To react to the gesture itself, use `(resizeStart)` / `(resizeChange)` / `(resizeEnd)` on the `resizable` element.

## See also

- `*FeaturesSubflows`
- `*FeaturesCustomNodes`
- `*FeaturesHandlingChanges`
