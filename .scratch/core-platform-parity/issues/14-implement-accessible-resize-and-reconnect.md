# Implement accessible resize and reconnect controls

Status: needs-triage
Tier: critical-parity
Depends on: 01, 09, 10, 11

## Problem

Library-generated resize controls and edge reconnection targets currently operate through pointer gestures. Issue 09 establishes readable entity semantics but explicitly defers these controls. Issue 10 covers node movement, and issue 11 mentions resize announcements without defining a keyboard resize workflow; neither closes this gap.

## Scope to specify

- Define accessible names, roles, instructions, focus entry/exit, and keyboard operation for resizing and reconnecting existing edges.
- Reuse the focus and connection foundations from issues 10–11 and respect existing resize/reconnection eligibility and connection validation.
- Define how changes and cancellations follow existing application-owned state and event contracts without introducing a separate graph store.
- Reuse localized action announcements and avoid duplicate feedback.
- Preserve independently interactive custom content: `[resizable]` hosts may wrap entire custom nodes and must not be hidden wholesale.

Exact shortcuts, control roles, sizing steps, focus restoration, and cancellation behavior require a separate design session; this issue is not ready for implementation.

## Acceptance to refine

- A keyboard-only user can resize an eligible node and reconnect an eligible edge, with understandable feedback and a predictable way to leave the interaction.
- Public-contract and browser tests cover eligibility, connection rejection, cancellation, and embedded controls.
- Manual screen-reader results document the supported workflows and remaining limitations.

## Comments

- Created from issue 09 grilling on 2026-09-05 (Q13). Deferring these controls does not make the existing pointer-only behavior accessible.
