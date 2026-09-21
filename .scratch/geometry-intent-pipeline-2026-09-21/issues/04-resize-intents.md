# Route the resizer through resize intents

Status: needs-triage
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
