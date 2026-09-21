# Make grid snapping an opt-in feature, `withSnapGrid()`

Status: needs-triage
Tier: 3.0-breaking
Depends on: 01, 03, 04

## Problem

Grid snapping is spread over three places that must agree: `alignToGrid` in the drag loop, the resizer's own
`getPointerPosition`, and the keyboard step that reads `snapGrid` for its size (`services/draggable.service.ts:56-63`).
None of them is on the pipeline, so a feature cannot order itself against the grid, and core keeps a behavior that
most flows switch off.

## Required behavior

- `withSnapGrid(grid: [number, number] | number)` returns a `VflowFeature<'snap-grid'>` registering a
  transform `{ id: 'snap-grid', precedence: 'default', kinds: ['move', 'resize'], phases: ['update', 'end'] }`.
- On `move` it aligns `point` to the grid, skipping claimed axes and claiming the axes it snaps. For
  `session.source === 'keyboard'` it rounds away from `session.initial` on the moved axis, so one press moves to the
  next grid line instead of rounding back.
- On `resize` it aligns `width`/`height` and the edge that moves, keeping the anchored edge fixed; a size never drops
  below the value the resizer already clamped to its minimum.
- The `snapGrid` input, `FlowSettingsService.snapGrid` and the resizer's snapping are removed; the keyboard step is a
  constant 5 px, ×4 with Shift.
- The feature lives in `libs/ngx-vflow/src/lib/features/snap-grid/` and imports only public API.
- Migration entry: `[snapGrid]="[20, 20]"` → `provideVflow(withSnapGrid([20, 20]))`.

## Acceptance

- Existing snap-grid specs for drag, keyboard and resize pass through the feature. Without it a drag writes
  unrounded points. An axis claimed by a `high` transform is not snapped. A keyboard move on a 20 px grid lands on the
  next line. On a grid smaller than the 5 px step (for example 2 px) a press moves by the step rounded up to the grid
  (6 px), where today it moved by the grid (2 px); the spec asserts this and the docs page states it.
- No `snapGrid` input in the built `index.d.ts`.

## Out of scope

- Snapping the connection preview or handle positions.
