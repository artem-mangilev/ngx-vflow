This example creates nodes by dragging them from a palette onto the flow, and attaches a node to a group or detaches it from one while it is dragged.

This implementation uses the following geometry and `VflowComponent` APIs:

- `clientToFlowPosition()` to convert the drop event into flow space
- `getNodesAtPoint()` to find a rendered parent and get the drop position in its node space
- `getIntersectingNodes()` to get intersections between nodes during drag operations
- `reparentNodes()` to move a node into a group or out of it

{{ NgDocActions.demoPane("DragAndDropNodesDemoComponent") }}
