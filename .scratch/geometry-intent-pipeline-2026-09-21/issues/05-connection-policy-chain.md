# Resolve connection validity through a policy chain

Status: needs-triage
Tier: 3.0-additive
Depends on: 01, 02

## Problem

Connection validity is a fixed `every` over two built-in validators and one application function
(`models/connection.model.ts:13-23`). A feature cannot add a rule, and a boolean chain forces the first rule to answer
for all.

## Required behavior

- `ConnectionPolicy = { id; precedence?; decide(candidate: ConnectionCandidate, ctx: VflowContext): boolean | null }`.
  `ConnectionCandidate` is today's validator argument (source, target, handles, handle types) plus
  `reconnection: Edge | null` and `gestureId`.
- The chain is resolved once from `VFLOW_CONNECTION_POLICIES` (precedence, then array order). Evaluation stops at
  the first `true` or `false`; all `null` means allowed.
- Core registers no policy. The `connection` input registers what it configures: `core:not-self` (`lowest`, present
  unless `allowSelfConnections`) and `core:application` (`default`, wraps `ConnectionSettings.validator`, returns
  `false` when the function returns `false`, else `null`). `notSameTypedHandlesValidator` leaves the chain and becomes
  an invariant checked next to `canStart`/`canAccept`.
- `ConnectionControllerDirective.validateConnection` and `endConnection` evaluate the chain after `canStart` /
  `canAccept`; the chain runs for creation and reconnection.
- A feature registers its policy on `VFLOW_CONNECTION_POLICIES` (issue 01) through `provideConnectionPolicy(entry)`.

## Acceptance

- Existing connection and reconnection specs pass. A feature policy at `high` returning `false` marks the candidate
  invalid and prevents `connect`; one returning `null` defers to the application validator; a `true` at `high` allows a
  self-connection that `core:not-self` would deny, because the chain stops at the first decision; a source-to-source
  drop stays invalid with an empty chain.
- Public-contract test verifies `allowSelfConnections: false` still denies without any feature.

## Out of scope

- Returning edge attributes from a policy; changing the `Connection` request shape.
