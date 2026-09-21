# Document the pipeline and add testing helpers

Status: needs-triage
Tier: 3.0-additive
Depends on: 01, 02, 03, 04, 05, 06, 07, 08, 09

## Problem

A feature author needs the vocabulary (intent, phase, claim, origin, gesture, revision), the ordering rule and the
state boundary in one place, and a way to test a transform without driving d3 in a spec.

## Required behavior

- Docs page "Features and `provideVflow()`": registration, precedence rule, the `core:` entries and the rule that
  separates a core entry from a feature,
  the claim protocol, the phase and veto table, origin and gesture id, revision for asynchronous producers, and the
  stated boundary: the pipeline covers library-originated changes only.
- Docs pages for `withAlignmentHelper()`, `withAutoPan()` and `withSnapGrid()` replace the input documentation; a section lists the behaviors that left core and must be opted in.
- `ngx-vflow/testing` gains `createGestureSession()` and `createMoveIntent()` / `createResizeIntent()` builders and a
  `runTransforms(intent, transforms, ctx)` helper so a transform is unit-testable without `<vflow>`.
- `CONTEXT.md` gains the terms "geometry intent", "gesture", "write origin" and "feature" (as distinct from
  "first-party extension" and "official recipe").

## Acceptance

- Every public symbol from issues 01–09 is documented with an example.
- A transform spec in the docs uses only `ngx-vflow/testing` helpers.

## Out of scope

- Documentation for seams defined by later specs.
