# Route the resizer through resize intents

Status: resolved
Tier: 3.0-breaking
Depends on: 03

## Problem

The resizer writes the node's position and size and every child's position straight from `onChange`
(`public-components/resizable/node-resize-control.component.ts:95-123`). It is the only existing "parent size ↔ child
positions" batch and it is closed, so a feature cannot constrain a resize and nothing else can write a size the
sanctioned way.

## Required behavior

- `onChange(change, childChanges)` builds a `resize` intent (`source: 'resizer'`, one session per gesture, `update`
  per change, `end` on `onEnd`) with the resized node's `point`/`width`/`height` plus one `point` change per child, and
  runs it through the pipeline. `resizing` is set before the first batch and cleared after `end`, as today.
- Applying a change with `width` or `height` marks the node explicitly sized (`resizedExplicitly`) before the size is
  written, whatever the origin, so a `propose()` from a feature behaves like the resizer. `NodeSizeChange.mode` reports
  `explicit` for such writes.
- Measurement (`NodeResizeControllerDirective.measure`) stays outside the pipeline and keeps its guards.
- The resizer's own grid snapping (`getPointerPosition` in `resizer.ts`) is removed; `withSnapGrid()` (issue 09) snaps
  `resize` changes instead. No transform clamps a resize to the parent (not current behavior).
- `false` from a transform on `update` drops the frame; on `end` it restores the session's initial geometry for the
  node and its children.

## Acceptance

- Existing resizer specs pass. A transform on `kinds: ['resize']` that caps `width` sees the capped value written and
  the inline size reflect it. A `propose('resize', ...)` from a feature turns an `auto` node explicit and survives the
  next ResizeObserver tick.
- `shouldResize` still vetoes the gesture before any intent is created.

## Out of scope

- Transforming measured sizes; a "min size by children" rule (a feature over `propose()`).

## Comments

- 2026-09-21: Implemented. `NodeResizeControlComponent` opens one session per gesture on the first accepted change
  (`source: 'resizer'`, nodes = the resized node and its children), turns every `onChange` into a `resize` intent
  (`update`) carrying the node's `point`/`width`/`height` and one `point` change per child, and runs `end` from
  `onEnd` with the current geometry; a vetoed `end` re-applies the initial position, size and child positions.
  `resizing` is set before the first batch and cleared after `end`, as before. The pipeline's `apply` turns the node
  explicit before writing a size, so the resizer no longer touches `resizedExplicitly`.
- `resizer.ts` lost its grid snapping: `getPointerPosition` returns the flow point, `ResizerStoreItems.snapGrid` is
  gone and `resizer-utils` reads `x`/`y`. The resizer knows nothing about any feature; `withSnapGrid()` snaps
  `resize` intents (issue 09).
- Observed while writing the spec: a static inline `style="width: …"` on the resizable element wins over the host
  size binding at measurement time, so the measured size overwrites the resized one after the gesture. The existing
  specs and docs size the element through CSS classes, which works; worth a note in the resizable docs.
- Verified: 317 library tests green (2 new in `features/resize-intents.spec.ts`: a capping transform and a vetoed
  end restoring node and children; 1 new resize case in the snap-grid spec), the existing resizable and
  audit-regression specs pass, ESLint and Prettier clean, `nx build ngx-vflow` succeeds, the docs app type-checks.
