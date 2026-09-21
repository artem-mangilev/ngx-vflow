# Route every movement through move intents

Status: resolved
Tier: 3.0-breaking
Depends on: 01, 02

## Problem

Pointer drag, auto-pan and keyboard movement all end in the private `DraggableService.moveNode`, which clamps and
writes in one step (`services/draggable.service.ts:316-329`). Nothing can transform or veto a position before it
reaches the application's signal, and the set of dragged nodes lives in a closure.

## Required behavior

- A `GeometryPipelineService` on `<vflow>` runs `GeometryIntent`s through the resolved transforms of
  `VFLOW_GEOMETRY_TRANSFORMS` (filtered by `kinds` and `phases`) and applies the surviving batch: `setPoint` for
  `point`, size writes per issue 04, all in one synchronous pass, then bumps the revision (issue 06).
- `DraggableService` builds one `GestureSession` per activation (`id`, `source: 'pointer'`, `initiator`, all
  `dragNodes`, `initial` geometry, `pointer` signal in flow space) and emits:
  - `start` at `activate()`; `false` leaves the gesture inactive and sets no status;
  - one `update` per d3 `drag` event with a change per dragged node (candidate `point` in parent space);
  - `end` on d3 `end` with the current geometry; `false` re-applies `session.initial`.
    The `node-drag-start/-drag/-end` statuses are set after the corresponding batch is applied, and their payload gains
    `session`.
- The pointer session derives the flow-space pointer from the last client point and the viewport, and re-emits an
  `update` when the viewport changes while the pointer is still. Auto-pan (issue 08) only pans.
- Keyboard `moveSelected` produces a one-shot session (`source: 'keyboard'`; `start`, `update`, `end` in one tick).
- `moveNode`, `alignToGrid` and `moveNodesOnAutoPan$` are deleted. Grid snapping becomes the feature of issue 09,
  which lands in the same phase. The parent clamp becomes the core entry `core:node-extent`
  (`precedence: 'lowest'`, `kinds: ['move']`), registered by `<vflow>` through the feature registry: it clamps a node
  whose `extent` resolves to `'parent'` using the parent's pending `width`/`height` from the same batch when present,
  else the model's, and ignores claims. `Node.extent`, its default and its `null` opt-out are unchanged. The keyboard
  step becomes a constant 5 px (×4 with Shift) and no longer reads `snapGrid`.
- A transform may push changes for nodes outside the session; unknown ids and non-finite numbers are dev-mode errors
  and the change is dropped.
- `GestureSession`, `GeometryIntent`, `GeometryChange`, `GeometryTransform`, `IntentPhase`, `WriteOrigin` and
  `NodeGeometry` are exported.

## Acceptance

- Existing drag, multi-drag, keyboard-move and parent-extent specs pass unchanged in behavior; snap-grid specs move to
  issue 09 and pass through the feature.
- New public-contract tests: a `high` transform that offsets `point` is reflected in the written position; a transform
  returning `false` on `start` prevents the drag status; `false` on `end` restores initial positions; a transform that
  appends a parent size change sees the parent grow and the child clamp against the new size in the same frame; a
  keyboard move runs the same transforms; without any feature the candidate point is written as computed, clamped only
  where `extent` asks for it.
- Per-frame allocation stays at one intent object and one change per dragged node (checked in a spec with a
  transform counting calls).

## Out of scope

- Resize intents (issue 04); metadata on change notifications (issue 06).
- Changing the pointer-level drag filter.

## Comments

- 2026-09-21: Implemented. `services/geometry-pipeline.service.ts` runs an intent through the registry's transforms
  and applies the surviving batch in one pass (`run`), and owns the session and revision signals the context
  exposes; it looks the registry and the context up late through `Injector`, which breaks the cycle
  registry → entry → context → pipeline → registry. `DraggableService` builds one session per activation, emits
  `start` at activation (a veto leaves the gesture inactive for the rest of the pointer sequence), one `update` per
  d3 drag event, and `end` on release (a veto re-applies `session.initial`); the three statuses carry `session`.
  Auto-pan following is now the session re-evaluating its last client point on every viewport pan
  (`viewportPans$`), so `moveNodesOnAutoPan$`, `moveNode` and `alignToGrid` are gone. Keyboard moves and
  `VflowContext.propose()` go through `runOneShot`, which runs the `start` transforms on the current geometry and
  the `update` and `end` transforms on the same proposal, then writes once, so a one-shot bumps the revision once and
  a veto in any phase writes nothing.
- Core entries: `<vflow>` provides `VFLOW_CORE_GEOMETRY_TRANSFORMS` (internal multi-token) with
  `NodeExtentTransform` (`core:node-extent`, `lowest`); the registry resolves core and feature entries together.
  A transitional `core:snap-grid` entry driven by the `snapGrid` input lived here for one commit and was removed by
  issue 09 in the same session.
- Verified: 308 library tests green (7 new in `features/move-intents.spec.ts` covering every acceptance bullet,
  including the per-frame allocation check), the existing drag, keyboard-navigation and parent-extent specs pass
  unchanged, ESLint and Prettier clean, `nx build ngx-vflow` succeeds. The docs e2e suite was not run.
