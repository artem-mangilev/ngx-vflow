# Harden the drag filter for a missing event target

Status: ready-for-agent
Priority: P2

## Problem

The new `.nodrag` filter casts `event.target` to `Element` and calls `closest()` without checking it. The existing primary-button unit test uses a synthetic event whose target is `null`, causing the library suite to fail with `Cannot read properties of null (reading 'closest')`.

Relevant code:

- `projects/ngx-vflow-lib/src/lib/vflow/services/draggable.service.ts`
- `projects/ngx-vflow-lib/src/lib/vflow/services/draggable.service.spec.ts`

## Required behavior

- Only call `closest()` when the target is an `Element`.
- Preserve primary-button, Ctrl-click, `.nodrag`, and explicit drag-handle filtering.

## Acceptance

- `npx ng test ngx-vflow-lib --watch=false --browsers=ChromeHeadless` reports no failures.
- Add or retain explicit cases for a null target, a `.nodrag` descendant, and a valid `.vflow-drag-handle` target.

## Comments
