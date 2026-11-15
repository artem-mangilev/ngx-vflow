You can add a `VflowNodeToolbarComponent` to your node. Its content sits outside one side of the node, chosen by the `position` input, and follows the node through dragging, zooming, elevation and virtualization.

{{ NgDocActions.demoPane("NodeToolbarDemoComponent") }}

The toolbar is an absolutely positioned element inside your node presentation, so a few layout rules apply:

- Put it directly inside the element that forms the node box. It is positioned against the nearest positioned ancestor, so a positioned wrapper deeper in the presentation would become its reference box instead.
- Do not clip the node box with `overflow: hidden`, or the toolbar is clipped with it.
- It is drawn in the stacking context of its node. A neighbouring node with a higher z-index can overlap it; `elevateNodesOnSelect` (on by default) keeps the toolbar of the selected node on top.
- The gap between the node and the toolbar is `10px`. Override it with the `--v-node-toolbar-offset` CSS variable on the node or any ancestor.
- Pointer gestures inside the toolbar never drag the node, so buttons and inputs work without `vNoDrag`.

## Multiple Toolbars

It's also possible to add multiple toolbars to the same node by simply including multiple `VflowNodeToolbarComponent` instances with different `position` inputs.

{{ NgDocActions.demoPane("MultipleNodeToolbarsDemoComponent") }}
