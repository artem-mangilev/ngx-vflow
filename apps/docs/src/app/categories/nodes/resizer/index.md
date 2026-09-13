You might want to resize your node. The resizer is part of core's interaction feedback and works with template groups and template/component nodes.

## Resize template group

This provides a way to have more control over the resizer:

- Create a `template-group` node.
  - If you want the resizer to appear consistently, add the `resizable` directive to the native HTML element representing your group.
  - If you want the resizer to appear conditionally, apply the directive as `[resizable]="yourCondition"`. You can bind the visibility of the resizer to the node’s selection state (see the code below for an example).
- **Important**: Use the `ctx.width()` and `ctx.height()` signals from the context, not `ctx.node.width` and `ctx.node.height`. The latter properties are not reactive, so the node won’t update its size based on the resizer.
- The resizer respects the `min-width` and `min-height` CSS properties of the resizable node, or you can pass `[minWidth]` / `[minHeight]` / `[maxWidth]` / `[maxHeight]` explicitly.
- Optionally, keep the aspect ratio with `[keepAspectRatio]`, restrict resizing to one axis with `[resizeDirection]` (`horizontal` | `vertical`), toggle handle auto-scaling with `[autoScale]`, and react to `(resizeStart)` / `(resizeChange)` / `(resizeEnd)`.

{{ NgDocActions.demoPane("TemplateGroupResizerDemoComponent") }}

## Resize a template/component regular node

The algorithm is almost the same as for `template-group` nodes:

- Create a node of type `html-template` or `CustomNodeComponent` (`CustomDynamicNodeComponent`).
  - If you want the resizer to always appear, add the `resizable` directive to the top-level element of your custom node (ideally, a wrapper for the entire node content).
  - If you want the resizer to appear conditionally, apply the directive as `[resizable]="yourCondition"`. Binding the visibility of the resizer to the node’s selection state can be useful.

- The resizer respects the `min-width` and `min-height` CSS properties of the element where the directive is applied.

- It's up to you to adjust the CSS of your custom node to ensure it renders correctly during resizing. The library only modifies the container size.

- Optionally, keep the aspect ratio with `[keepAspectRatio]`, restrict resizing to one axis with `[resizeDirection]` (`horizontal` | `vertical`), toggle handle auto-scaling with `[autoScale]`, and react to `(resizeStart)` / `(resizeChange)` / `(resizeEnd)`.

{{ NgDocActions.demoPane("TemplateNodeResizerDemoComponent") }}

## Resizer appearance

The resize controls take their colors from the core tokens `--vflow-selection` and `--vflow-surface`; the `.resize-control` class (with `.handle` / `.line` variants) is the public selector for size and shape overrides.

## Resize event

You may want to perform some actions on resize. To do this, simply add handler to the `(nodesChanges.size)` output of the `<vflow />` component.

## See also

- `*FeaturesSubflows`
- `*FeaturesCustomNodes`
- `*FeaturesHandlingChanges`
