# Move the alignment helper onto the pipeline as `withAlignmentHelper()`

Status: needs-triage
Tier: 3.0-breaking
Depends on: 03, 06

## Problem

`AlignmentHelperComponent` is a snap-on-drop feature written inside core against `node-drag-end` and `setPoint`
(`components/alignment-helper/alignment-helper.component.ts:150-173`), switched on by the `alignmentHelper` input. It
is the best proof the pipeline can carry a real feature, and while it stays an input it competes with `snapGrid`
without a defined order.

## Required behavior

- `withAlignmentHelper(options?: { tolerance?: number })` returns a `VflowFeature<'alignment-helper'>`
  registering an `AlignmentHelperTransform` (`id: 'alignment-helper'`, precedence `high`, `kinds: ['move']`,
  `phases: ['update', 'end']`) and an `AlignmentHelperState` service holding the guide lines.
- On `update` the transform computes candidate lines and stores them in the state (no geometry change); on `end` it
  writes the snapped `point` for the initiator and claims the snapped axes, so `withSnapGrid()` leaves them alone.
- The core overlay renders the lines from `AlignmentHelperState` when the service is present
  (`inject(AlignmentHelperState, { optional: true })`); the `alignmentHelper` input is removed. Rendering moves to
  the ephemeral layer in its own spec.
- The docs demo and its page use `provideVflow(withAlignmentHelper())`; a migration entry names the removed input.

## Acceptance

- Existing alignment-helper specs and the docs e2e pass through the feature. Snapping to a guide wins over grid
  snapping on drop. Without the feature no lines render and no snapping happens.
- No `alignmentHelper` input in the built `index.d.ts`.

## Out of scope

- Snapping during `update` (helper-lines behavior); the ephemeral layer.
