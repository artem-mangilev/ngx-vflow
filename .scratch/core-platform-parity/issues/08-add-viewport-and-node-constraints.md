# Add viewport and node movement constraints

Status: needs-triage
Tier: critical-parity
Depends on: 04

## Problem

Nodes can be constrained to a parent, but consumers cannot declare general movement extents or constrain viewport translation. Auto-pan is one global boolean instead of a policy per interaction.

## Required behavior

- Add viewport translation bounds.
- Add global and per-node movement extents while preserving `extent: 'parent'`.
- Define node origin semantics for positioning, resizing, bounds, fit-view, and group coordinates.
- Extend the public `getNodesBounds` options from issue 02 with the same node-origin semantics; do not introduce a bounds-only origin interpretation.
- Split auto-pan settings for node drag, connection drag, selection, and keyboard focus.
- Make auto-pan speed and activation margin configurable.
- Apply constraints consistently during pointer interaction, keyboard movement, resize, programmatic viewport changes, and fit-view where applicable.

## Acceptance

- Viewport panning cannot escape configured translation bounds.
- Nodes respect global, per-node, and parent constraints with documented precedence.
- Non-default node origins produce correct edges, bounds, resize, snap, and group-space conversions.
- Auto-pan can be enabled and tuned independently by operation.
- Tests cover nested groups, non-unit zoom, conflicting constraints, and auto-pan at each boundary.

## Out of scope

- Automatic group expansion or reflow.
- Runtime reparenting.
- Layout constraints.

## Comments
