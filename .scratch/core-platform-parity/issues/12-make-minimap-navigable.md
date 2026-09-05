# Make the minimap navigable

Status: needs-triage
Tier: critical-parity
Depends on: 07, 08

## Problem

The minimap is a read-only SVG preview with pointer input disabled. React Flow, Foblex Flow, and ngDiagram treat the minimap as a navigation control.

## Required behavior

- Allow clicking a minimap location to center or move the main viewport according to a documented policy.
- Allow dragging the viewport mask to pan the main viewport.
- Add optional minimap pan and zoom gestures with configurable zoom step.
- Respect main viewport zoom limits and translation bounds.
- Prevent minimap interaction from accidentally initiating pane pan, node selection, or page scrolling.
- Preserve a lightweight SVG representation rather than mounting application node components twice.

## Acceptance

- Click and drag navigation remain aligned at non-unit zoom and with flows far from the origin.
- Minimap zoom respects the main flow's min/max zoom and gesture settings.
- Pointer capture and cancellation behave correctly when the pointer leaves the minimap.
- The underlying pane remains interactive outside the minimap bounds.
- Browser tests cover mouse and touch navigation, bounds, zoom limits, resize, and nested group bounds.
- Existing read-only behavior can be retained through an explicit setting if required for compatibility.

## Out of scope

- Rendering Angular node templates inside the minimap.
- A separate overview window.
- Minimap keyboard semantics and per-node presentation hooks.

## Comments
