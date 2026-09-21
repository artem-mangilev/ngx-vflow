# Make grid snapping an opt-in feature, `withSnapGrid()`

Status: resolved
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
  `session.source === 'keyboard'` the proposed delta counts steps of `KEYBOARD_MOVE_STEP` and the node moves that
  many grid lines from where it started (one per press, four with Shift), so keyboard and pointer land on the same
  lines and acceleration survives on a grid.
- On `resize` it aligns `width`/`height` and the edge that moves, keeping the anchored edge fixed; a size never drops
  below the value the resizer already clamped to its minimum.
- The `snapGrid` input, `FlowSettingsService.snapGrid` and the resizer's snapping are removed; the keyboard step is a
  constant 5 px, ×4 with Shift.
- The feature lives in `libs/ngx-vflow/src/lib/features/snap-grid/` and imports only public API.
- Migration entry: `[snapGrid]="[20, 20]"` → `provideVflow(withSnapGrid([20, 20]))`.

## Acceptance

- Existing snap-grid specs for drag, keyboard and resize pass through the feature. Without it a drag writes
  unrounded points. An axis claimed by a `high` transform is not snapped. A keyboard move on a 20 px grid lands on the
  next line and a Shift press four lines further. On a grid smaller than the 5 px step (for example 2 px) a press still
  moves one grid line, as today; the spec asserts this.
- No `snapGrid` input in the built `index.d.ts`.

## Out of scope

- Snapping the connection preview or handle positions.

## Comments

- 2026-09-21: Implemented in `libs/ngx-vflow/src/lib/features/snap-grid/`: `withSnapGrid(grid)` provides
  `SnapGridSettings` (a class with a writable `grid` signal, so the application changes the grid while the flow
  runs) and registers `SnapGridTransform` (`snap-grid`, `default`, `kinds: ['move']`, `phases: ['update', 'end']`).
  The `snapGrid` input, `FlowSettingsService.snapGrid`, the testing mock's input and the transitional
  `core:snap-grid` entry of issue 03 are gone; the keyboard step is the constant 5 px (×4 with Shift) and the
  transform rounds a keyboard move away from `session.initial`.
- Keyboard: the transform counts the proposed delta in `KEYBOARD_MOVE_STEP`s and moves that many grid lines from
  where the node started (one per press, four with Shift), so keyboard behaviour on a grid is unchanged. One
  deliberate change: pointer and resize snapping round to the nearest grid line (the old `align` always rounded up).
- `resize` intents (issue 04, done in the same session): the transform snaps the edge that moves and keeps the
  anchored edge in place, shifting the children back by whatever the snap added to the origin; the resizer has no
  knowledge of the grid any more.
- Docs: the four demos that passed `[snapGrid]` now use `provideVflow(withSnapGrid(...))`; the keyboard demo toggles
  the grid through `SnapGridSettings`; the snap-to-grid and accessibility pages describe the feature.
- Verified: 317 library tests green (7 new in `features/snap-grid/snap-grid.spec.ts`), ESLint and Prettier clean,
  `nx build ngx-vflow` succeeds with no `snapGrid` input in `index.d.ts`, the docs app type-checks.
