# Angular DOM-first handles: scroll / collapse follow-up

Promoted from `prototype/dom-first-handles` to the `new-design-system-pi` working tree at the user's request. User approved keeping connections visible and docking hidden field ports to scroll boundaries / the header. No commit, version bump or release performed.

Main-worktree verification after promotion: **230 core tests, all 30 Chromium docs tests, core/UI lint and core/testing/UI/BPMN development builds passed**. Normal demos run on port **4200**; prototype scripts, Playwright port 4300 and standalone HTML archives were not imported. Documentation and ADR-0008 describe the new contract. The sections below retain the focused prototype verification and diagnosis history.

## Implementation

- Core `NodeHandlesControllerDirective` captures non-bubbling scroll on the node host. Reuses the existing per-node animation-frame batch, read-before-write measurement and teardown guard; removes the listener on destroy.
- Entities owns an `EntityPortsDirective` recipe. Handles are permanently mounted in zero-height absolute anchors outside the fields' overflow/display:none container. Their field IDs and DOM identity survive scroll/collapse/reorder.
- Visible rows determine Y via DOM rects normalized by rendered scale. Hidden rows clamp to the visible field bounds. Crowded ports spread in field order (12 flow px spacing in this small demo). Collapse places them along the sides of the header. Both source and target sides remain accessible and connectable.
- Inset rows still inset the anchor horizontally. Core measures the actual handle; it does not implement docking or project it onto the node boundary.
- Explicit invalidation: `VflowComponent.refreshNodeHandles(readonly string[])` requests node-scoped, coalesced measurement on the next animation frame. Unknown IDs are ignored, editor instances are isolated, culled nodes retain geometry until restored, and destroyed views ignore queued work. It does not move DOM or mutate application graph state.
- The recipe emits `portsPlaced` after CSS writes; the Entities composition calls `flow()?.refreshNodeHandles([ctx.node.id])`. No synthetic scroll events or new geometry service. Internal notification lives on the node model and the existing controller owns scheduling/teardown.
- CSSOM rounds serialized fractional coordinates. The recipe compares numeric positions with a 0.001 flow px tolerance, not exact strings: otherwise an Angular output in `afterEveryRender` repeatedly marks the view dirty and triggers NG0103. The browser regression caught this and now checks console errors and absence of synthetic scroll.
- Recipe placement runs on native scroll, Angular render and host resize. Core measurements are batched; recipe DOM reads are not yet globally frame-batched. Not a performance acceptance result.

## Verification

```bash
npx playwright test -c apps/docs-e2e/playwright.config.ts entities-scroll-collapse.spec.ts design-system.spec.ts --reporter=line
# 16 passed
NX_DAEMON=false npx nx test ngx-vflow --watch=false --browsers=ChromeHeadless
# 230 passed
NX_DAEMON=false npx nx build ngx-vflow --configuration=development
# ngx-vflow and ngx-vflow/testing built successfully
```

Browser checks: wheel scroll does not change graph viewport; SVG endpoints match actual port rims within 1 screen px; docked ports are within bounds and distinct; collapsed handles remain measurable in header; fit/zoom, expand, compact, reorder and DOM identity; existing rename, deletion, reconnection and accessibility checks. Scroll/collapse screenshots are emitted by the new test to `test-results/`. The final 16-test browser run passed; the new scenario also passed 3 sequential repetitions. One parallel-repeat stress run had 2 wheel-scroll initiation timeouts (scrollTop stayed zero), so repeated concurrent gesture execution is not claimed deterministic.

Adjusted an existing Pipeline test to compare node coordinates relative to canvas, not browser viewport: native input focus scrolls the page, which previously falsely appeared to move the node.

The four old inline-placement assertions have been adapted to DOM geometry / normalized endpoints. The full run revealed one more such assertion in CSS virtualization; it now also verifies handle placement and cached endpoints on each visible restoration frame.

Added public-interface integration tests in `refresh-node-handles.spec.ts`: a position-only CSS mutation first produces >40px stale endpoint error, then an explicit request repairs it to <0.1px without recreating the port or emitting scroll; same-ID editors are independent; unknown/empty requests are harmless; queued deletion/destruction and cull/restore are safe. Controller tests verify explicit requests and native scroll share one batch and teardown.

Full core unit suite: **230 passing / 0 failing**.

### Resizable test timing diagnosis

The two prior `resizable-measurement.spec.ts` failures (also reproduced on unchanged HEAD `162e2db7`) were premature assertions, not a stuck resize. The old helper awaited Angular stability and one animation frame; neither guarantees that native ResizeObserver delivery and the resulting model-sized wrapper render have completed.

Measured after minimum width drops from 420 to 240:

```text
frame 0: surface=350, wrapper=420
frame 1: surface=350, wrapper=350
```

Waiting additional frames made both cases pass before any implementation change. Replaced the one-frame helper with bounded observation of the expected surface/wrapper sizes and port alignment (maximum 10 frames). All original final assertions remain unconditional, so a real non-converging geometry bug still fails. No resizable runtime code changed; temporary measurement logs removed. The focused suite passed and the subsequent full unit/browser runs passed (230 / 16).

Prevention: DOM-layout tests must wait for the observable geometry result, not equate Angular `whenStable()` or a single rAF with browser observer/render completion.

## Remaining recipe / acceptance limits

Small fixed field sets only: when many hidden ports exceed available header/boundary space, spacing shrinks and another UX policy is needed. No field virtualization, arbitrary rotations, large-list performance or proxy labels/tooltips established. The DOM-first geometry tests are adapted and the resizable test timing blocker is resolved. ADR-0008 and migration docs are updated; default-presentation removal and broader isolated-consumer/version acceptance are separate work.
