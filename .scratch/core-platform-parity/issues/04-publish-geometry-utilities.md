# Publish path, viewport, and coordinate utilities

Status: resolved
Tier: critical-parity
Depends on: —

## Problem

ngx-vflow contains path and viewport math internally, while the public API exposes only a subset through the rendered component. Custom edges, overlays, layout integrations, export code, and external drag/drop need stable pure geometry helpers.

## Required behavior

- Export supported straight, bezier, step, and smooth-step path builders with label or midpoint metadata where meaningful.
- Export a viewport-for-bounds helper that consumes bounds calculated by issue 02.
- Provide both document-to-flow and flow-to-document coordinate transformations.
- Define transformations for nested group coordinate spaces.
- Keep pure geometry functions independent of DOM and Angular injection.
- Keep rendered DOM measurement behind the public flow facade.

## Acceptance

- A custom edge can use the same supported path math as a built-in edge.
- A consumer can calculate a viewport for known bounds without rendering a flow.
- Coordinate transforms round-trip within documented numeric tolerance at non-unit zoom and translated viewports.
- Nested-space conversion behavior is documented and tested.
- Existing internal callers use the public implementation where semantics are identical.

## Out of scope

- Waypoints, obstacle routing, or interactive edge editing.
- SSR rendering.
- Layout algorithms.

## Comments

- Agreed during pre-implementation grilling: keep the full `CurveFactoryParams` context for custom factories, while public built-in path helpers accept only the geometry they use and return the existing `CurveLayout` shape.
- Publish `getStraightPath`, `getBezierPath`, and `getSmoothStepPath`. Step paths use `getSmoothStepPath({ borderRadius: 0 })`; do not add a duplicate `getStepPath` alias.
- Preserve existing path and label-point semantics. Expose the existing bezier curvature, smooth-step offset, and border-radius constants as optional parameters with their current defaults.
- Publish the existing positional `getViewportForBounds(bounds, width, height, minZoom, maxZoom, padding)` contract with numeric padding. Accept zero-sized bounds, validate finite non-negative bounds, positive viewport dimensions, `0 < minZoom <= maxZoom`, and `padding > -1`. A rendered `fitView` call with no resolved nodes or an unmeasured container is a no-op.
- Use `client space` for DOM `clientX`/`clientY` coordinates. Replace the breaking public component API with symmetric `clientToFlowPosition` and `flowToClientPosition` methods, backed by pure functions that accept the viewport and flow-container position explicitly.
- Remove `documentPointToFlowPoint`, its `{ spaces: true }` overload, `SpacePoint`, and the internal `getSpacePoints` helper. Replace the overloaded containment behavior with an explicit live `getNodesAtPoint(flowPoint)` facade method that returns topmost-first shallow node copies with snapshot `nodeSpacePoint` values.
- Add pure `nodeSpaceToFlowPosition` and `flowToNodeSpacePosition` helpers using an explicit space-node id and readonly node lookup. Any node may define a node space. A missing requested node returns `undefined`; a missing ancestor terminates the chain as a root; a cycle returns `undefined` with a development warning.
- Coordinate transforms reject a non-positive or non-finite zoom, do not round results, and round-trip within floating-point test tolerance.
- Document the public surface on one `Geometry utilities` page under `Utilities` and record the breaking coordinate migration.

## Answer

Resolved on 2026-08-29.

- Published the built-in path builders, viewport-for-bounds helper, symmetric client/flow transforms, and explicit nested node-space transforms from the package entry point.
- Internal edge rendering, pointer geometry, resizing, viewport fitting, and the drag/drop recipe now reuse the public geometry implementations where their semantics match.
- Removed the superseded document/space-point APIs and documented the breaking migration and new utility surface.
- Follow-up: the drag/drop recipe uses the explicit containment facade, reparents through coordinate signals in place, and updates both toolbar flags atomically, preventing node recreation and transiently missing attach/detach actions.
- Verified with 106 library tests, the focused demo regression test, library and demo lint, the packaged library build, and the documentation demo build.
