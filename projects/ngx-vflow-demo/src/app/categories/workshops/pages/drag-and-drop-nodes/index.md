This workshop will show you how to implement dynamic node creation with basic drag and drop functionality. It also demonstrates how to attach nodes to groups or detach them from groups.

This implementation uses the following APIs from `VflowComponent`:

- `documentPointToFlowPoint()` to get a stack of `SpacePoint`s
- `getIntersectingNodes()` to get intersections between nodes during drag operations
- `toNodeSpace()` to get a node's position in the coordinate system of another node

{{ NgDocActions.demoPane("DragAndDropNodesDemoComponent") }}
