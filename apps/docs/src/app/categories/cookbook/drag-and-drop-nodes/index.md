This workshop will show you how to implement dynamic node creation with basic drag and drop functionality. It also demonstrates how to attach nodes to groups or detach them from groups.

This implementation uses the following geometry and `VflowComponent` APIs:

- `clientToFlowPosition()` to convert the drop event into flow space
- `getNodesAtPoint()` to find a rendered parent and get the drop position in its node space
- `getIntersectingNodes()` to get intersections between nodes during drag operations
- `reparentNodes()` to move a node into a group or out of it

{{ NgDocActions.demoPane("DragAndDropNodesDemoComponent") }}
