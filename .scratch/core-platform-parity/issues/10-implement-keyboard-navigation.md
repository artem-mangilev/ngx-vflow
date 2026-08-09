# Implement keyboard focus and graph navigation

Status: needs-triage
Tier: critical-parity
Depends on: 01, 08, 09

## Problem

Keyboard settings currently cover only selection modifiers. Users cannot traverse graph entities, select them, move nodes, or keep focused content visible without a pointer.

## Required behavior

- Define predictable focus entry, traversal, and exit for nodes and edges.
- Support keyboard selection, deselection, and multi-selection.
- Move selected movable nodes with arrow keys and a configurable accelerated step.
- Pan focused entities into view while respecting viewport constraints.
- Respect per-entity focus, selection, visibility, and movement policies.
- Ignore graph shortcuts while focus is inside inputs, textareas, contenteditable regions, or opted-out controls.

## Acceptance

- A keyboard-only user can enter the flow, traverse focusable nodes and edges, select entities, move nodes, and leave the flow.
- Focus order is deterministic for nested groups and updates safely when entities are added or removed by the application.
- Movement uses existing writable signals and emits the same public change events as pointer movement.
- Focus auto-pan respects configured bounds and does not cause unexpected zoom.
- Unit and browser tests cover nested groups, hidden/disabled entities, multi-selection, embedded controls, and entity removal during focus.

## Out of scope

- Keyboard connection creation and deletion.
- Command palette UI.
- Spatial-navigation algorithms beyond the documented initial policy.

## Comments
