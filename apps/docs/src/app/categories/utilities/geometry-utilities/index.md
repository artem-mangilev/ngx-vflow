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

## Floating endpoints

`getFloatingEdgeParams` builds the endpoints of an edge between two rectangles that does not use fixed handles: each endpoint is where the segment between the centers crosses the border of its rectangle, and the side is the border it crosses. The result feeds `getBezierPath` or `getSmoothStepPath`. Handles with `position="auto"` use the middle of the facing side instead; this utility is for custom curves that want the exact crossing.

```ts
import { getBezierPath, getFloatingEdgeParams } from 'ngx-vflow';

const params = getFloatingEdgeParams({ x: 0, y: 0, width: 160, height: 80 }, { x: 300, y: 200, width: 160, height: 80 }, { inset: { end: 1.65 } });
const path = getBezierPath(params);
```

`inset` moves an endpoint away from its rectangle along the side, which keeps an arrow tip on the border: a curve factory receives the distances of the edge markers as `markerInset`. A rectangle without size stands for a point, such as the pointer of a connection in progress. Curve factories also receive `sourceNode` and `targetNode`, the absolute position and measured size of the nodes, which are the rectangles to pass here.

## Viewport

```ts
import { getViewportForBounds } from 'ngx-vflow';

const viewport = getViewportForBounds(bounds, { width, height }, { minZoom: 0.5, maxZoom: 2, padding: 0.1 });
```

`width` and `height` are the size of the flow. `padding` is optional, `0` by default, and relative to the bounds. Bounds may have zero width or height, but sizes cannot be negative. The viewport dimensions and zoom limits must be positive and finite, and padding must be greater than `-1`.

## Client and flow space

Use the component methods when a `VflowComponent` is available. The component measures its own container:

```ts
const flowPoint = vflow.clientToFlowPosition({ x: event.clientX, y: event.clientY });
const clientPoint = vflow.flowToClientPosition(flowPoint);
```

The pure functions of the same names take the viewport and the flow container's client-space position as arguments, where the methods read them from the component:

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
const [topmost] = vflow.getNodesAtPoint(flowPoint);
const node = topmost.node;
const pointInsideTopmostNode = topmost.nodeSpacePoint;
```

Each result is a `NodeAtPoint`: `node` is the application node object itself (`topmost.node === node` in your collection), and `nodeSpacePoint` is a snapshot of the queried point relative to that node's top-left corner. Results contain all rendered nodes at the point and are ordered from topmost to bottommost.

## Nested node space

Node points are relative to their parent. Supply a lookup containing the requested node and any available ancestors to convert through that hierarchy:

```ts
import { flowToNodeSpacePosition, nodeSpaceToFlowPosition } from 'ngx-vflow';

const nodeLookup = new Map(nodes.map((node) => [node.id, node]));
const childPoint = flowToNodeSpacePosition(flowPoint, childId, nodeLookup);
const flowPointAgain = nodeSpaceToFlowPosition(childPoint!, childId, nodeLookup);

// A node's position in the space of another node: its origin in flow space, then into the other space.
const childInFlow = nodeSpaceToFlowPosition({ x: 0, y: 0 }, childId, nodeLookup);
const childInOtherNode = childInFlow && flowToNodeSpacePosition(childInFlow, otherId, nodeLookup);
```

A missing requested node, target space, or parent cycle returns `undefined`. A missing ancestor ends the traversal and treats the last available node as a root.
