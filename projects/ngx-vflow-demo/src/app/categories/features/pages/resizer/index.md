# {{ NgDocPage.title }}

You may want to resize your node. Such functionality works for almost any type of node.

## Resize default group

To resize a default group, just pass a `resizable` flag to `Node` (or `DynamicNode`) with `default-group` type.

{{ NgDocActions.demo("DefaultGroupResizerDemoComponent", { expanded: true }) }}

## Resize template group

This a way to get more control over resizer. 

- create a `template-group` node.
  - if you want a resizer appear every time: add a `resizable` directive to an SVG element (highly likely it's a `<svg:rect />`) that represents your group.
  - if you want a resizer appear based on some condition, apply that directive as `[resizable]="yourCondition"`. It may be useful to bind the visibility of resizer to node selection state (see the code below how to do this).
- **Imprortant**: use a `ctx.width()` and `ctx.height()` signals from context, and not a `ctx.node.width` and `ctx.node.height`. The problem with later is that these properties are not reactive, so the node will not reflect the size applied by resizer.
- resizer respects `min-width` and `min-height` CSS properties on resizable node.
- optionally, you could change a `[resizerColor]` and `[gap]` between node and resizer with more customization options to come in the future.
 
{{ NgDocActions.demo("TemplateGroupResizerDemoComponent", { expanded: true }) }}

## Resize a template/component regular node

Algorithm is almost the same

- create an node with type `html-template` or `CustomNodeComponent` (`CustomDynamicNodeComponent`)
  - if you want a resizer appear every time: add a `resizable` directive somewhere on the top level of your custom node (ideally if it's a wrapper of the whole node content).
  - if you want a resizer appear based on some condition, apply that directive as `[resizable]="yourCondition"`. It may be useful to bind the visibility of resizer to node selection state.
- resizer respects `min-width` and `min-height` CSS properties on element where directive was applied.
- it's up to you adjust your CSS of custom node to be correctly drawn during node resizing. The library just changes the container size. 
- optionally, you could change a `[resizerColor]` and `[gap]` between node and resizer with more customization options to come in the future.

{{ NgDocActions.demo("TemplateNodeResizerDemoComponent", { expanded: true }) }}

## See also

- `*FeaturesSubflows`
- `*FeaturesCustomNodes`
