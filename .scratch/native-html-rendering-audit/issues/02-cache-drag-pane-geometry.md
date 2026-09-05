# Cache pane geometry during node drag

Status: ready-for-agent
Priority: P1

## Problem

`DraggableService.getFlowPoint()` calls `element.closest('.vflow-pane')` and `pane.getBoundingClientRect()` on every drag event, although the pane rect is invariant during an ordinary drag and during viewport auto-pan.

In a 120-step drag, the migration raised geometry reads from roughly 119 to 362 and scripting time from 1.12 s to 1.94–2.12 s.

Relevant code: `projects/ngx-vflow-lib/src/lib/vflow/services/draggable.service.ts`.

## Required behavior

- Resolve the pane and read its rect once at drag start.
- Reuse that rect for subsequent drag events.
- Invalidate it only for a real pane geometry change such as root resize or document layout/scroll, not viewport pan or zoom state changes inside the pane.
- Preserve snap-to-grid, parent extent, multi-selection, auto-pan, touch dragging, and drag at non-unit zoom.

## Acceptance

- A multi-step drag does not read the pane bounding rect once per pointer movement.
- A +60/+40 screen-pixel drag at zoom 1.6245 still produces approximately +36.93/+24.62 flow units without an initial jump.
- Auto-pan and root-resize scenarios use correct coordinates.
- Focused drag tests and the full library test/build commands pass.

## Comments
