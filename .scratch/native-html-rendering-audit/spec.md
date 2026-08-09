# Native HTML rendering migration audit

The `3.0` branch replaces SVG `foreignObject` rendering with native HTML nodes inside a CSS-transformed viewport while retaining SVG for curves and overlays. This audit compares `cb8fa0fe` with `5f0686e2`, the direct parent of the first migration commit `140f3e2c` and the merge-base with `origin/main`.

## Agreed contract

- `svg-template`, `NodeSvgTemplateDirective`, and `nodeSvgTemplate` are intentional v3 removals.
- `groupNode`, handle `[template]`, and `[resizable]` keep their existing names but become HTML-only contracts. Migration documentation, rather than renamed APIs or runtime heuristics, communicates the break.
- The handle wrapper owns placement; the obsolete SVG placement `ctx.point` is removed from custom handle template context.
- Resizer `[gap]` remains public with its old meaning and default of `1.5px`.
- Standard handles derive geometry without DOM measurement. Custom handles use coalesced read and write phases, at most once per node per frame.
- Per-edge SVG remains the chosen stacking model because it preserves edge/node `z-index` interleaving. Its measured paint cost is tracked separately and does not block v3.
- Documented Angular APIs, classes, and observable behavior are compatibility contracts. Exact private DOM structure is not.

See [ADR-0001](../../docs/adr/0001-native-html-node-rendering.md).

## Confirmed regressions

### Handle initialization blocks early interaction

On `/performance/stress-test` with 1,024 nodes and 1,023 edges, HEAD performs 40,960 `getBoundingClientRect()` calls during initialization. Median layout count rose from 13 to 2,061 and layout duration from 34 ms to 1.27 s.

A cold wheel input is queued for 1.21–1.24 s by the first handle-sync wave. A second wave after the wheel blocks the next frame for 0.72–0.74 s, producing a reproducible 0.80–0.90 s frame gap. Once initialization settles, the CSS-transform zoom path is faster than the base and remains within frame budget.

### Drag repeats invariant geometry work

`DraggableService` resolves the pane and reads its bounding rect for every drag event. A 120-step drag increased rect reads from roughly 119 to 362 and scripting time from 1.12 s to 1.94–2.12 s.

### Custom edges cannot receive pointer input

The per-edge SVG host has `pointer-events: none`, while custom edge interaction paths do not opt back in. Selection, elevation, mouse/touch handling, and the delete-selected cookbook scenario are unreachable.

### Minimap hover cannot receive pointer input

The fixed minimap SVG has `pointer-events: none`, so the nested `mouseover` and `mouseleave` handlers never run and `scaleOnHover` is inert.

### Drag filter test suite is red

The `.nodrag` lookup calls `closest()` when a synthetic event has `target === null`. The library suite reports 53 passing tests and one failure.

### Public HTML migration is internally inconsistent

- Existing SVG `groupNode`, custom handle, and SVG-host resizer templates can still compile but no longer render correctly.
- Handle `ctx.point` silently changed from local placement coordinates to absolute flow coordinates even though HTML handles no longer need it.
- `[gap]` disappeared from `ResizableComponent` and its testing mock without being an intended migration break.
- `ngx-vflow/testing` still exports `NodeSvgTemplateMockDirective`, although production removed the corresponding API.
- Public documentation still instructs consumers to use SVG for group nodes, custom handles, and template-group resizers, and contains no v3 migration section.

## Measured architectural risk

With 1,023 visible edges, the per-edge SVG model adds approximately 108 ms of paint work over a 30-wheel burst, or about 3.6 ms per wheel event, and roughly 20% TaskDuration on the measured machine. It did not produce a frame longer than 16.7 ms in the settled benchmark and is not the cause of the cold-start freeze.

## Runtime scenarios verified without additional regression

- Empty-canvas pan.
- Node drag at non-unit zoom.
- Default handle and edge endpoint alignment.
- Strict connection creation and reconnection from both ends.
- Shift selection box.
- Alignment helper rendering and snap.
- Parent/group drag with child and edge updates.
- Default-group, template-group, and template-node resizing.
- Node toolbar positioning and actions.
- HTML edge-label interaction.
- Virtualization preview and hydration across its zoom threshold.

## Delivery constraints

- Issues 01–07 block the v3 release.
- Issue 08 is non-blocking research.
- Do not rename `groupNode`, handle `[template]`, or `[resizable]`.
- Do not add runtime SVG-template detection heuristics.
- Do not add a persistent performance benchmark or timing threshold yet; use focused temporary instrumentation while implementing the performance tickets.

## Issues

1. [Eliminate handle initialization layout thrashing](issues/01-eliminate-handle-layout-thrashing.md)
2. [Cache pane geometry during node drag](issues/02-cache-drag-pane-geometry.md)
3. [Restore custom-edge pointer interactions](issues/03-restore-custom-edge-pointer-interactions.md)
4. [Restore minimap hover interaction](issues/04-restore-minimap-hover.md)
5. [Harden the drag filter for a missing event target](issues/05-harden-drag-filter-target.md)
6. [Align the public API, testing entrypoint, and migration documentation](issues/06-align-html-api-and-migration-docs.md)
7. [Restore the resizer gap input](issues/07-restore-resizer-gap.md)
8. [Investigate per-edge SVG paint cost](issues/08-investigate-per-edge-svg-paint.md)
