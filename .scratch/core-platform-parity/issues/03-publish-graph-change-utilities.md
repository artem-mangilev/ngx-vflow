# Publish structural graph operation helpers

Status: needs-triage
Tier: critical-parity
Depends on: —

## Problem

The application owns structural graph state, but consumers do not have supported helpers for planning and applying common structural operations. The current signal model also means that interactive change notifications cannot be treated blindly as reducer actions: position, selection, and size may already have been written to application-provided signals by core.

## Required behavior

- Define which public changes are post-mutation interactive notifications and which are pre-application structural requests.
- Provide pure helpers for adding, removing, and reparenting entities and for reconnecting edges.
- Let structural helpers return an explicit next collection or structural change plan without maintaining a store or writing interactive signals.
- Provide explicit id, cascade, missing-entity, and duplicate-connection policies.
- Preserve unrelated entity object and signal identities.
- Do not reapply position, selection, or size notifications that core has already committed to writable signals.
- Keep the interface smaller than the operation implementation: callers should not need to reproduce descendant, connection, or coordinate bookkeeping.
- Keep application-specific validation and persistence outside the helpers.

## Acceptance

- Every public `NodeChange` and `EdgeChange` variant is documented as either a notification or a structural request; none has ambiguous double-application semantics.
- Structural operation results are deterministic, including multiple operations affecting the same entity.
- Node helpers handle descendants and reparenting; edge helpers handle custom handles, self-connections, duplicate connections, and missing endpoints according to documented options.
- Unit tests at the public interface cover identity preservation, ordering, conflicting operations, and no-op operations.
- Examples show application-owned collections applying structural requests while interactive writable signals remain shared with core.

## Out of scope

- Undo/redo history.
- A generic reducer for already-committed interactive signal updates.
- Transactions across arbitrary application state.
- Automatic id generation policy beyond an injectable or caller-provided strategy.

## Comments
