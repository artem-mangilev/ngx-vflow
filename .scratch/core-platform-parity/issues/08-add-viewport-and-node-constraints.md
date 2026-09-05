# Configure auto-pan for node and connection dragging

Status: resolved
Tier: critical-parity
Depends on: 04

## Problem

Auto-pan has one global boolean and hard-coded speed and activation margin. Consumers cannot configure it independently for node and connection dragging.

## Required behavior

- Allow auto-pan to be enabled independently for node dragging and connection dragging.
- Make speed and activation margin configurable, shared by both operations.
- Apply settings when the editor is created; document that later setting changes are not supported by this scope.
- Extend the existing `autoPan` input to accept a boolean or an options object with optional `nodeDrag`, `connectionDrag`, `speed`, and `margin` fields. Preserve boolean usage and the existing default behavior.
- Use `connectionDrag` for both connection creation and reconnection.
- Express `speed` as the maximum per-axis pan speed in viewport pixels per second, defaulting to `600`; use elapsed frame time so speed does not depend on display refresh rate. This approximates the previous 10 pixels per frame at 60 Hz.
- Express `margin` in viewport pixels, defaulting to `48`. Preserve the existing quadratic acceleration toward the viewport edge.
- Default omitted options to `nodeDrag: true`, `connectionDrag: true`, `speed: 600`, and `margin: 48`. Boolean `true` uses these defaults; boolean `false` disables auto-pan.
- A zero `speed` or `margin` disables auto-pan. Replace negative or non-finite numeric values with the corresponding default and warn in development mode.

## Acceptance

- Node-drag and connection-drag auto-pan can be enabled independently.
- Both operations use the configured shared speed and activation margin.
- Tests cover operation switches and configured speed and margin at viewport edges.
- Equal elapsed time produces equivalent pan distance at different frame rates.
- Tests cover boolean compatibility, omitted options, zero values, and fallback with development warnings for negative values, `NaN`, and infinities.

## Out of scope

- Automatic group expansion or reflow.
- Runtime reparenting.
- Layout constraints.
- Runtime changes to auto-pan settings.

## Deferred from original scope

- Viewport translation bounds, including programmatic viewport changes and fit-view.
- Global and per-node movement extents, precedence with parent constraints, and consistent drag/resize behavior.
- Configurable node origins across positioning, bounds, fit-view, edges, resize, snap, and nested node-space conversions, including public `getNodesBounds` options.
- Auto-pan for selection and keyboard focus, and keyboard node movement constraints.

These capabilities need separate scoping before implementation.

## Comments

- Agreed during grilling: auto-pan settings are configured when the editor is created. Reacting to later setting changes is not required for this issue; document the initialization-only behavior in the API. The remaining feature scope is still under discussion.
- Agreed during grilling: the first stage is limited to independent node/connection auto-pan switches with shared speed and activation margin. The other capabilities are deferred. Public API details remain under discussion.
- Agreed during grilling: retain boolean `autoPan` and add `{ nodeDrag, connectionDrag, speed, margin }` options with existing behavior as the default. Connection creation and reconnection share `connectionDrag`.
- Agreed during grilling: use frame-rate-independent speed in pixels per second (default `600`) and margin in pixels (default `48`), preserving the existing edge acceleration.
- Agreed during grilling: omitted fields use the documented defaults, zero speed or margin disables auto-pan, and negative or non-finite values fall back to defaults with development warnings.

## Confirmed implementation scope

The user confirmed the complete first-stage specification and authorized implementation. Deferred capabilities remain outside this issue's implementation scope.

## Answer

Resolved on 2026-09-05.

- Added the public `AutoPanSettings` interface and retained boolean `autoPan` compatibility, including the testing mock.
- Implemented independent node and connection switches, shared frame-rate-independent speed and margin, initialization-only capture, and validated numeric defaults.
- Documented the API, units, zero-disable behavior, development warnings, and lifecycle semantics on the viewport gestures page.
- Verified 157 library tests, the demo test, 29 focused auto-pan tests after the final test-host lint adjustment, library typechecking/lint, and library/testing-package and documentation-demo builds.
- Parallel code review: Standards — no actionable findings; Spec — no actionable findings.
- Viewport/node constraints, configurable origins, and new selection/focus auto-pan remain deferred.
