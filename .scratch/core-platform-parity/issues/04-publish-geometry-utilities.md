# Publish path, viewport, and coordinate utilities

Status: needs-triage
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
