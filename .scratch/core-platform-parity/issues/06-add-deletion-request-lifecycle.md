# Add a structural deletion request lifecycle

Status: wontfix
Tier: critical-parity
Depends on: 01, 02, 03

## Problem

Deleting selected entities is an official recipe. Core cannot calculate cascades, support keyboard deletion, or let the application veto and replace the requested operation.

## Required behavior

- Define one typed deletion request produced by a pure helper for application-owned pointer, toolbar, and programmatic triggers and emitted by core for keyboard deletion.
- Calculate affected nodes, descendants, and connected edges without mutating application state.
- Let the application decide whether and how to update its owned collections from the proposed deletion set.
- Support configurable delete shortcuts through the keyboard work in issue 11.

## Acceptance

- Deleting a node proposes all required connected-edge and descendant changes according to documented cascade rules.
- The application may apply all, none, or an application-defined transformation of a request without core mutating node/edge collections.
- Pure helpers can apply accepted changes to application-owned collections.
- Tests cover mixed selection, groups, detached edges, partial veto, missing ids, and repeated requests.
- The delete-selected cookbook is simplified to use the supported lifecycle.

## Out of scope

- Undo/redo.
- Confirmation-dialog UI.
- Backend authorization.
- Post-application deletion reporting.
- Per-entity deletion eligibility; the application enforces deletion policy when handling a request.
- Trigger-source metadata.
- Request identity, pending state, and duplicate suppression.

## Answer

Closed on 2026-08-30. A separate deletion lifecycle has no responsibility under the application-owned state model: application UI calls the existing `removeNodes` and `removeEdges` helpers directly, while ignoring an operation is already a veto and any alternative collection update is already an application-defined transformation. Issue 03 owns cascade calculation and application helpers; issue 11 owns emitting selected node and edge ids for keyboard deletion. No deletion-request helper, facade method, capability, or post-application report will be added.

## Comments

- Grilling round 1: application-owned pointer, toolbar, and programmatic paths use a pure request helper; core emits the same request type for its keyboard path. No structural deletion method is added to the live flow facade.
- A deletion request is only a pre-application proposal. Core does not emit a post-delete report because it cannot reliably infer why application-owned collections changed.
- Selection and focus eligibility do not imply deletion eligibility. No `deletable` capability is added; the application owns deletion and may ignore a request.
- Grilling round 2: there is no accept/reject/replace protocol. The request is a proposal only; the application may update its collections however it chooses and remains responsible for structural validity.
- Grilling round 3: deletion requests carry no trigger-source metadata, id, or pending state. Repeating a request against the same snapshot is deterministic; repeating it after application is an ordinary no-op.
