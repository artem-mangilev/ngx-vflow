# Make the minimap navigable

Status: resolved
Tier: critical-parity
Depends on: 07

## Problem

The minimap is a read-only canvas preview with pointer input disabled. Add optional navigation while retaining the cached node bitmap and the existing read-only default.

## Required behavior

- Add `pannable` and `zoomable` inputs, both defaulting to false, and `zoomStep`, defaulting to 0.1 (a multiplicative wheel step of 1.1).
- With panning enabled, clicking centers the main viewport on the chosen flow-space point without changing zoom. Dragging the visible viewport area preserves the grab offset; dragging elsewhere centers first and then follows the pointer.
- Support mouse and single-pointer touch navigation, wheel zoom and trackpad pinch zoom. Zoom preserves the main viewport center.
- Respect the main viewport gesture settings, activation shortcuts, selection priority, permitted pan mouse buttons, and min/max zoom. Minimap switches remain an additional opt-in gate. Ordinary wheel scroll pans when main scroll panning is enabled, unless the zoom activation key is held.
- Use the main pane click-distance setting to distinguish clicks from drags. Reject non-positive or non-finite zoom steps by falling back to 0.1.
- Prevent minimap interaction from accidentally initiating pane pan, node selection, or page scrolling.
- Preserve the canvas renderer and its cached node previews; do not mount application node components twice. Use CSS-pixel pointer coordinates independently of the canvas device-pixel ratio.

## Acceptance

- Click and drag navigation remain aligned at non-unit zoom and with flows far from the origin.
- Minimap zoom respects the main flow's min/max zoom and gesture settings.
- Pointer capture and cancellation behave correctly when the pointer leaves the minimap.
- The underlying pane remains interactive outside the minimap bounds.
- Browser tests cover mouse and touch navigation, graph bounds, zoom limits, resize, and nested group bounds.
- Existing read-only behavior remains the default. Enabling input affects only the canvas rectangle, not the full overlay.

## Out of scope

- Rendering Angular node templates inside the minimap.
- A separate overview window.
- Minimap keyboard semantics and per-node presentation hooks.
- Two-finger touchscreen pinch zoom.
- Viewport translation bounds: issue 08 was narrowed to auto-pan and explicitly deferred these. Integrate minimap navigation with a shared constraint mechanism when that mechanism exists.

## Comments

- 2026-09-06: Updated for the existing canvas renderer. Navigation reuses its graph transform and the shared viewport write path. Issue 08 is no longer a dependency because translation bounds were deferred there.

## Answer

Resolved on 2026-09-06.

- Added opt-in `pannable`, `zoomable`, and `zoomStep` inputs and matching testing mocks. The documentation demo enables both navigation switches; the component default remains read-only.
- Reused the cached graph transform for inverse pointer coordinates and the existing viewport write path for click centering, offset-preserving dragging, scroll panning, and center-preserving wheel/trackpad zoom. Camera movement does not redraw node previews.
- Applied the main flow gesture policy, mouse-button restrictions, selection priority, activation keys, zoom limits, and wheel-step validation. Pointer capture continues drags outside the canvas; cancellation, capture loss, window blur, and disabling panning release the gesture.
- Kept event interception within the canvas rectangle. Documented page-scroll suppression, gesture routing, drag cancellation, read-only defaults, and deferred features.
- Verified: all 216 ChromeHeadless library tests; 3 Playwright scenarios with real mouse/touch input at DPR=2, including capture, cancellation, resize and zoom limits; library/demo lint; packaged library/testing and documentation-demo builds. Focused tests additionally cover far-origin nested group bounds, gesture settings, step validation, and preview-cache reuse.
- Translation bounds remain deferred until a shared viewport constraint mechanism exists. Two-finger touchscreen pinch and minimap keyboard semantics remain outside this issue.
