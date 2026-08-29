# Add a structural deletion request lifecycle

Status: needs-triage
Tier: critical-parity
Depends on: 01, 02, 03

## Problem

Deleting selected entities is an official recipe. Core cannot calculate cascades, support keyboard deletion, or let the application veto and replace the requested operation.

## Required behavior

- Define a typed deletion request for pointer, keyboard, toolbar, and programmatic triggers.
- Calculate affected nodes, descendants, and connected edges without mutating application state.
- Let the application accept, reject, or replace the proposed deletion set.
- Define post-application reporting without falsely claiming that application-owned state changed before it is observed.
- Support configurable delete shortcuts through the keyboard work in issue 11.

## Acceptance

- Deleting a node proposes all required connected-edge and descendant changes according to documented cascade rules.
- The application can veto or transform a request synchronously without core mutating node/edge collections.
- Pure helpers can apply accepted changes to application-owned collections.
- Tests cover mixed selection, groups, detached edges, partial veto, missing ids, and repeated requests.
- The delete-selected cookbook is simplified to use the supported lifecycle.

## Out of scope

- Undo/redo.
- Confirmation-dialog UI.
- Backend authorization.

## Comments
