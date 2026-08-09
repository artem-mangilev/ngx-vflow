# Establish graph accessibility semantics

Status: needs-triage
Tier: critical-parity
Depends on: 01

## Problem

The rendered graph has no documented accessibility contract for graph entities, handles, controls, or status feedback. Custom node content cannot repair missing wrapper semantics, graph relationships, or localized descriptions.

## Required behavior

- Define roles, accessible names, descriptions, and relationships for the flow, nodes, edges, groups, handles, and minimap.
- Add localizable label and instruction configuration with useful defaults.
- Allow safe public DOM and ARIA attributes on entity wrappers without exposing private structure.
- Represent selected, disabled, hidden, and connection-validity states accessibly.
- Add a live-region foundation for issue 11 without emitting duplicate or noisy announcements.
- Document responsibilities that remain with custom node content.

## Acceptance

- Default nodes, edges, groups, handles, and the flow surface expose a coherent accessibility tree.
- Custom entities can override labels and descriptions without replacing wrapper behavior.
- All default strings are configurable and localizable.
- Axe or equivalent automated checks pass for documented default scenarios, with explicit manual screen-reader checks recorded.
- Tests cover policy-disabled, selected, hidden, grouped, and invalid-connection states.

## Out of scope

- Keyboard traversal and movement.
- Keyboard connection workflow.
- Domain-specific descriptions generated from application data without caller input.

## Comments
