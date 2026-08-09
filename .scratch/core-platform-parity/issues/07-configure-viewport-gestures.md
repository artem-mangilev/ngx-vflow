# Make viewport gesture policy configurable

Status: needs-triage
Tier: critical-parity
Depends on: —

## Problem

Pan and zoom work, but most input policy is hard-coded in the D3 integration. Embedding a flow inside a complex application requires control over wheel, pinch, drag, double-click, scroll, mouse buttons, thresholds, and page scrolling.

## Required behavior

- Add public settings for wheel zoom, pinch zoom, double-click zoom, drag panning, and scroll panning.
- Allow callers to choose pan mouse buttons and optional activation keys.
- Add configurable click/drag and connection-drag thresholds where gesture ambiguity exists.
- Define whether and when the flow prevents page scrolling.
- Provide supported no-pan, no-drag, and no-wheel escape mechanisms for controls embedded in nodes and overlays.
- Preserve current behavior as the compatibility default unless a deliberate migration is documented.

## Acceptance

- Every supported gesture can be independently enabled or disabled.
- Embedded inputs and scrollable controls can opt out without private CSS knowledge.
- Mouse, trackpad, and touch behavior is covered by focused tests.
- Programmatic viewport changes remain available regardless of gesture settings.
- Public documentation includes common canvas-style and embedded-editor configurations.

## Out of scope

- Full touch gesture expansion beyond existing pan/zoom paths.
- Viewport translation bounds and operation-specific auto-pan.
- A ready-made Controls component.

## Comments
