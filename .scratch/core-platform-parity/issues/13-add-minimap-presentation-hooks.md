# Add minimap presentation and accessibility hooks

Status: needs-triage
Tier: critical-parity
Depends on: 01, 09, 12

## Problem

The minimap uses fixed built-in preview styles and has no public entity interaction or accessibility contract. Once it becomes interactive, consumers need a supported way to distinguish nodes and keyboard users need an operable navigation surface.

## Required behavior

- Add per-node or per-type minimap presentation hooks for color, stroke, class, and lightweight SVG preview data.
- Add node activation events without rendering the full custom node DOM.
- Define accessible name, instructions, focus behavior, and keyboard navigation for the minimap control.
- Expose selected, hidden, grouped, and viewport-mask states consistently.
- Keep customization functions pure and inexpensive for large graphs.

## Acceptance

- Consumers can visually distinguish node types and states without duplicating node components.
- Clicking or keyboard-activating a minimap node can focus or center it through documented events/settings.
- The minimap is labeled and operable without a pointer.
- Hidden and non-focusable entity policies are respected.
- Performance tests demonstrate that presentation hooks do not create an Angular component tree per minimap node.
- Documentation includes custom styling, node activation, and accessible navigation examples.

## Out of scope

- Arbitrary Angular templates in the minimap.
- Editing graph entities directly inside the minimap.
- Canvas/WebGL minimap rendering.

## Comments
