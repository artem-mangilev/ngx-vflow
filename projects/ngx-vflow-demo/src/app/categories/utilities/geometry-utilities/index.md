Geometry utilities are pure functions that can be used without a rendered flow. They use the same path, viewport, and coordinate calculations as the built-in components.

## Edge paths

```ts
import { getBezierPath, getSmoothStepPath, getStraightPath } from 'ngx-vflow';

const straight = getStraightPath({ sourcePoint, targetPoint });
const bezier = getBezierPath({
  sourcePoint,
  targetPoint,
  sourcePosition: 'right',
  targetPosition: 'left',
  curvature: 0.25,
});
const smoothStep = getSmoothStepPath({
  sourcePoint,
  targetPoint,
  sourcePosition: 'right',
  targetPosition: 'left',
  offset: 20,
  borderRadius: 5,
});
```

Each function returns a `CurveLayout` with the SVG `path` and label points. For a sharp step path, pass `borderRadius: 0` to `getSmoothStepPath`.

## Viewport

```ts
import { getViewportForBounds } from 'ngx-vflow';

const viewport = getViewportForBounds(bounds, width, height, 0.5, 2, 0.1);
```

`padding` is numeric and relative to the bounds. Bounds may have zero width or height, but sizes cannot be negative. The viewport dimensions and zoom limits must be positive and finite, and padding must be greater than `-1`.

## Client and flow space

Use the component methods when a `VflowComponent` is available. The component measures its own container:

```ts
const flowPoint = vflow.clientToFlowPosition({ x: event.clientX, y: event.clientY });
const clientPoint = vflow.flowToClientPosition(flowPoint);
```

The pure functions accept the same viewport plus the flow container's client-space position:

```ts
import { clientToFlowPosition, flowToClientPosition } from 'ngx-vflow';

const options = {
  viewport: { x: -100, y: 40, zoom: 1.5 },
  containerPosition: { x: containerRect.left, y: containerRect.top },
};

const flowPoint = clientToFlowPosition(clientPoint, options);
const clientPointAgain = flowToClientPosition(flowPoint, options);
```

Both functions reject a non-positive or non-finite zoom. Results are not rounded; a round trip may differ only by JavaScript floating-point error.

When a rendered `VflowComponent` is available, query the nodes under a flow-space position directly:

```ts
const nodes = vflow.getNodesAtPoint(flowPoint);
const topmostNode = nodes[0];
const pointInsideTopmostNode = topmostNode.nodeSpacePoint;
```

Each result is a shallow copy of the application node with a snapshot `nodeSpacePoint`: the queried point relative to that node's top-left corner. Signal-valued fields keep their original references. Results contain all rendered nodes at the point and are ordered from topmost to bottommost.

## Nested node space

Node points are relative to their parent. Supply a lookup containing the requested node and any available ancestors to convert through that hierarchy:

```ts
import { flowToNodeSpacePosition, getNodePositionInSpace, nodeSpaceToFlowPosition } from 'ngx-vflow';

const nodeLookup = new Map(nodes.map((node) => [node.id, node]));
const childPoint = flowToNodeSpacePosition(flowPoint, childId, nodeLookup);
const flowPointAgain = nodeSpaceToFlowPosition(childPoint!, childId, nodeLookup);
const childPositionInParent = getNodePositionInSpace(childId, parentId, nodes);
```

A missing requested node, target space, or parent cycle returns `undefined`. A missing ancestor ends the traversal and treats the last available node as a root. `getNodePositionInSpace` accepts the node collection directly; pass `null` as its target space to get the node's flow-space position.
