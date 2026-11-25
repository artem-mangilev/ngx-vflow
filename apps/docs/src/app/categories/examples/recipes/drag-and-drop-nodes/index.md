This example creates nodes by dragging them from a palette onto the flow, with the HTML drag and drop API through [ngx-drag-drop](https://github.com/reppners/ngx-drag-drop). A node dropped on the group becomes its child. The toolbar of a child detaches it, and a node dragged over the group gets a button that attaches it.

This implementation uses the following geometry and `VflowComponent` APIs:

- `clientToFlowPosition()` to convert the drop event into flow space
- `getNodesAtPoint()` to find a rendered parent and get the drop position in its node space
- `getIntersectingNodes()` to find the group under a node after it was moved
- `reparentNodes()` to move a node into a group or out of it

{{ NgDocActions.demoPane("DragAndDropNodesDemoComponent") }}
