# Eliminate handle initialization layout thrashing

Status: ready-for-agent
Priority: P0

## Problem

`HandleModel.sync()` alternates geometry reads, style writes, and more geometry reads. Handle initialization invokes it repeatedly through `HandleComponent`, `NodeHandlesControllerDirective`, duplicate `ResizeObserver` callbacks, and animation-frame batching.

On the 1,024-node stress demo this produces 40,960 `getBoundingClientRect()` calls, 2,061 layouts, 1.27 s of layout time, and a reproducible 0.80–0.90 s cold-start frame gap when zoom input arrives between synchronization waves.

Relevant code:

- `projects/ngx-vflow-lib/src/lib/vflow/models/handle.model.ts`
- `projects/ngx-vflow-lib/src/lib/vflow/directives/node-handles-controller.directive.ts`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/handle/handle.component.ts`
- `projects/ngx-vflow-lib/src/lib/vflow/services/resize-observer.service.ts`

## Required behavior

- Derive standard handle geometry from node dimensions and handle position without reading rendered DOM geometry.
- Measure custom handles only when their anchor or dimensions can have changed.
- Register one observer per distinct observed element, even when multiple handles share an anchor.
- Coalesce synchronization to at most one pass per node per animation frame.
- Read all required geometry before writing styles.
- Preserve handle placement, connection endpoints, custom handle rendering, resize updates, and group movement at every zoom level.

## Acceptance

- The cold-start wheel no longer waits behind repeated handle synchronization waves.
- Temporary instrumentation on `/performance/stress-test` shows no `getBoundingClientRect()` calls for standard-handle initialization and no duplicate sync wave per node.
- A custom-handle or host resize performs at most one coalesced measurement pass per node per frame.
- Existing handle and edge model tests pass, with focused coverage for standard and custom handle alignment after node resize.
- `npx ng test ngx-vflow-lib --watch=false --browsers=ChromeHeadless` and `npx ng build ngx-vflow-lib` pass.

## Comments
