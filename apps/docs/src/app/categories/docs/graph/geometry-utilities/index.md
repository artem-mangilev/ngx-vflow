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

Client space and flow space are converted by the flow, which measures its own container:

```ts
const flowPoint = vflow.clientToFlowPosition({ x: event.clientX, y: event.clientY });
const clientPoint = vflow.flowToClientPosition(flowPoint);
```

Results are not rounded; a round trip may differ only by JavaScript floating-point error.

When a rendered `VflowComponent` is available, query the nodes under a flow-space position directly:

```ts
const [topmost] = vflow.getNodesAtPoint(flowPoint);
const node = topmost.node;
const pointInsideTopmostNode = topmost.nodeSpacePoint;
```

Each result is a `NodeAtPoint`: `node` is the application node object itself (`topmost.node === node` in your collection), and `nodeSpacePoint` is a snapshot of the queried point relative to that node's top-left corner. Results contain all rendered nodes at the point and are ordered from topmost to bottommost.

## Nested node space

Node points are relative to their parent. `flow.getNodeRect(id)` returns the rendered rectangle of a node in flow space, its absolute position included, so converting between flow space and the space of a node is a subtraction or an addition:

```ts
const rect = vflow.getNodeRect(childId);
if (rect) {
  // A flow-space point in the space of the node, and back.
  const childPoint = { x: flowPoint.x - rect.x, y: flowPoint.y - rect.y };
  const flowPointAgain = { x: childPoint.x + rect.x, y: childPoint.y + rect.y };
}

// A node's position in the space of another node: subtract the absolute position of the other node.
const child = vflow.getNodeRect(childId);
const other = vflow.getNodeRect(otherId);
const childInOtherNode = child && other && { x: child.x - other.x, y: child.y - other.y };
```

`getNodeRect` returns `undefined` for an unknown node or one that has not been measured yet.
