# Implement per-entity capability policies

Status: needs-triage
Tier: critical-parity
Depends on: —

## Problem

The public entity model has isolated flags such as node `draggable`, edge `reconnectable`, and global `entitiesSelectable`, but no consistent capability vocabulary. Consumers cannot declaratively make one node non-selectable, one edge non-deletable, or one handle unavailable as a connection start without custom event filtering.

## Required behavior

- Define global defaults with per-entity overrides for node and edge selection, deletion, focus, and visibility.
- Define per-handle connection capabilities, including whether a handle can start or accept a connection.
- Preserve existing `draggable`, `reconnectable`, `selected`, and global selection behavior without silent semantic changes.
- Enforce policies consistently across pointer, selection-box, reconnection, future keyboard, and deletion paths.
- Expose policy state to custom node, edge, and handle templates where it affects presentation.
- Keep structural changes application-owned.

## Acceptance

- Nodes and edges can independently opt in or out of selection, deletion, focus, and rendering without application-side event interception.
- Handles can independently reject connection start and connection end before validation runs.
- Global settings provide defaults and per-entity settings override them predictably.
- Hidden entities have documented effects on rendering, queries, selection, fit-view, and connected edges.
- Focused tests cover global defaults, per-entity overrides, selection box, pointer selection, reconnect, and disabled handles.
- Public API documentation defines the policy precedence and migration behavior.

## Out of scope

- Keyboard traversal implementation.
- ARIA labels and arbitrary DOM attributes.
- Node movement extents and origin.

## Comments
