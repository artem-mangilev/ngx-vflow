# Tag writes with origin and gesture id and expose the revision

Status: needs-triage
Tier: 3.0-additive
Depends on: 03, 04

## Problem

Change notifications report a value with no author and no gesture (`types/node-change.type.ts`). A feature cannot
tell its own writes from the user's, so "feature writes → notification → feature reacts" loops through the 25 ms
`observeOn` delay (`services/node-changes.service.ts:84`); the application cannot group one gesture into one undo
step; an asynchronous producer cannot tell whether the graph moved under it.

## Required behavior

- `NodePositionChange` and `NodeSizeChange` gain `meta: { origin: WriteOrigin; gestureId: string }`. The pipeline
  records the meta on the model before each write and `NodesChangeService` attaches it to the emitted change.
- `ConnectStartEvent`, `ConnectEndEvent`, `ReconnectStartEvent` and `ReconnectEndEvent` gain `gestureId`; the request
  emitted between them belongs to that gesture. Documented as the correlation rule.
- `WriteOrigin` is `'core' | (string & {})`; features use their feature id, `propose()` outside a feature uses
  `'application'`.
- `VflowContext.revision` increments after every applied batch and whenever the `nodes` or `edges` input changes
  identity. Documented pattern for asynchronous producers: capture, compute, compare, propose or discard.

## Acceptance

- A drag emits position changes whose `meta.gestureId` is the same across nodes and frames and whose origin is
  `'core'`; a `propose()` from a feature carries the feature id; a keyboard move carries a new gesture id per press.
- A spec shows a feature ignoring its own writes by origin and not re-proposing.
- `revision` increments once per applied batch and once per `nodes` input change; a spec discards a stale result.

## Out of scope

- An undo/redo implementation; the application groups by `gestureId` itself.
