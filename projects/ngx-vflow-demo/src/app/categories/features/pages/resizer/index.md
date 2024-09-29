# {{ NgDocPage.title }}

You might want to resize your node. This functionality works with nearly all types of nodes.

## Resize default group

To resize a default group, simply pass the `resizable` flag to a `Node` (or `DynamicNode`) of type `default-group`.

{{ NgDocActions.demo("DefaultGroupResizerDemoComponent", { expanded: true }) }}

## Resize template group

This provides a way to have more control over the resizer:

- Create a `template-group` node.
  - If you want the resizer to appear consistently, add the `resizable` directive to the SVG element (likely a `<svg:rect />`) representing your group.
  - If you want the resizer to appear conditionally, apply the directive as `[resizable]="yourCondition"`. You can bind the visibility of the resizer to the node’s selection state (see the code below for an example).
- **Important**: Use the `ctx.width()` and `ctx.height()` signals from the context, not `ctx.node.width` and `ctx.node.height`. The latter properties are not reactive, so the node won’t update its size based on the resizer.
- The resizer respects the `min-width` and `min-height` CSS properties of the resizable node.
- Optionally, you can customize the `[resizerColor]` and the `[gap]` between the node and the resizer, with more customization options coming in the future."

{{ NgDocActions.demo("TemplateGroupResizerDemoComponent", { expanded: true }) }}

## Resize a template/component regular node

The algorithm is almost the same as for `template-group` nodes:

- Create a node of type `html-template` or `CustomNodeComponent` (`CustomDynamicNodeComponent`).
  - If you want the resizer to always appear, add the `resizable` directive to the top-level element of your custom node (ideally, a wrapper for the entire node content).
  - If you want the resizer to appear conditionally, apply the directive as `[resizable]="yourCondition"`. Binding the visibility of the resizer to the node’s selection state can be useful.

- The resizer respects the `min-width` and `min-height` CSS properties of the element where the directive is applied.

- It's up to you to adjust the CSS of your custom node to ensure it renders correctly during resizing. The library only modifies the container size.

- Optionally, you can customize the `[resizerColor]` and the `[gap]` between the node and the resizer, with more customization options coming in the future.

{{ NgDocActions.demo("TemplateNodeResizerDemoComponent", { expanded: true }) }}

## See also

- `*FeaturesSubflows`
- `*FeaturesCustomNodes`
