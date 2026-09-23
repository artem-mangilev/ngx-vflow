You can add a `NodeToolbarComponent` to your node. Its content sits outside one side of the node, chosen by the `position` input, and follows the node through dragging, zooming, elevation and virtualization.

{{ NgDocActions.demoPane("NodeToolbarDemoComponent") }}

The toolbar is an absolutely positioned element inside your node presentation, so a few layout rules apply:

- Put it directly inside the element that forms the node box. It is positioned against the nearest positioned ancestor, so a positioned wrapper deeper in the presentation would become its reference box instead.
- Do not clip the node box with `overflow: hidden`, or the toolbar is clipped with it.
- It is drawn in the stacking context of its node. A neighbouring node with a higher z-index can overlap it; `elevateNodesOnSelect` (on by default) keeps the toolbar of the selected node on top.
- The gap between the node and the toolbar is `10px`. Override it with the `--vflow-toolbar-offset` CSS variable on the node or any ancestor.
- Pointer gestures inside the toolbar never drag the node, so buttons and inputs work without `vflowNoDrag`.

**Major-release migration:** the toolbar is no longer rendered in a separate layer above the graph; the `node-toolbar` element itself is the positioned box inside the node. Selectors that targeted `.vflow-toolbar` must target `node-toolbar`, and node presentations clipped with `overflow: hidden` must stop clipping the node box.

## Multiple Toolbars

It's also possible to add multiple toolbars to the same node by simply including multiple `NodeToolbarComponent` instances with different `position` inputs.

{{ NgDocActions.demoPane("MultipleNodeToolbarsDemoComponent") }}
