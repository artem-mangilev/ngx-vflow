# Visual regression audit after the design-system migration

2026-09-09, branch `new-design-system`. The broken implementation was `f250c602`; the comparison baseline was `1c3e2d06`.

The previous functional acceptance missed incomplete migrations in existing demos. This follow-up compared rendered scenes, not just element counts. Six focused browser tests now cover the reported and additionally discovered failures.

## Coverage

Inspected 53 inline local graph scenes across the documentation navigation, plus the two fullscreen view-size scenes. Captured each inline scene before and after the fixes, with a separate pre-migration checkout for comparison. Utilities/testing pages contain no additional live graph demos. The five Studio examples load in remote iframes and do not consume the local package build; their embedding and loaded previews were checked separately.

The inline inventory includes all demos under Introduction, Nodes, Edges, Handles, Interactions, Viewport, Performance, Cookbook and Design system, including multiple demos on one page. Hidden nodes/edges in lazy-loading and virtualization remain intentional. Third-party video availability and random colors/layouts in force/Vizdom examples are not deterministic visual baselines.

## Fixed

| Failure                                                                                      | Cause and fix                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview lost five of six edges                                                              | Its template rendered only the animated variant. It now supplies every edge's visible path and preserves animation, markers and selection.                                                      |
| Drag-handle example lost both edges                                                          | Added its missing presentation template.                                                                                                                                                        |
| Groups disappeared in drag-and-drop, resizer, keyboard, accessibility and alignment examples | Models had been migrated to `template-group` without supplying a `groupNode` template. Added the missing frames.                                                                                |
| Normal groups became red custom groups in subflows/minimap/snap-to-grid                      | The two old group types collapsed into one type without a presentation discriminator. Application data now distinguishes the custom group.                                                      |
| Frames blended into the editor surface                                                       | The common group border now uses a visible 2px muted-color outline.                                                                                                                             |
| Simple card text was left-aligned                                                            | The convenience card centers its content in both axes, independently of general-purpose node/body layout.                                                                                       |
| Every edge label became Delete                                                               | The label demo now renders string labels as text and only its action label as a named native button.                                                                                            |
| Ports appeared inside/below their nodes                                                      | CSS offsets were expressed in node space even when a positioned row/card was the actual containing block. Handle measurement converts CSS offsets while retaining edge endpoints in node space. |
| Resizable overview card had a 100×50 wrapper around 240×320 content                          | The wrapper now respects intrinsic minimum dimensions. The existing ResizeObserver remains the sole measurement owner; no one-shot lifecycle measurement remains.                               |
| Selected edges looked like keyboard-focus dashes                                             | Selection uses a solid stroke; keyboard focus retains the separate dashed indicator.                                                                                                            |
| View-size documentation referenced a missing demo name                                       | Corrected the auto-size demo reference and verified both fullscreen routes.                                                                                                                     |

The resize/handle defect was also reproducible in the pre-migration checkout; it was fixed because it is part of the reported broken experience. Core-only resizable sample content uses `width/height: 100%` and `box-sizing: border-box` to follow the allocated wrapper without a border-size feedback loop.

## Verification

- Five new regression tests were red before their corresponding fixes; all six focused tests now pass (the sixth protects the separately observed drag-handle failure).
- Overview passed 10 repeated browser runs after replacing a racy first attempt at measuring resize content.
- Full Chromium documentation suite: **26 passed**.
- Full unit suite: **213 core + 1 docs passed**.
- Built-package consumers: **2 passed each** for core-only, compiled CSS and source CSS; these include resize/endpoints and axe checks.
- Core/UI package build, docs TypeScript check and all four ESLint targets passed.

```sh
NX_DAEMON=false npx playwright test -c apps/docs-e2e/playwright.config.ts apps/docs-e2e/presentation-regressions.spec.ts --workers=2
NX_DAEMON=false npx playwright test -c apps/docs-e2e/playwright.config.ts --workers=2
NX_DAEMON=false npx nx run-many -t test --watch=false --browsers=ChromeHeadless --parallel=1
NX_DAEMON=false npx nx build ui
UI_CSS_MODE=core NX_DAEMON=false npx playwright test -c apps/docs-e2e/ui-consumer.config.ts
UI_CSS_MODE=compiled NX_DAEMON=false npx playwright test -c apps/docs-e2e/ui-consumer.config.ts
UI_CSS_MODE=source NX_DAEMON=false npx playwright test -c apps/docs-e2e/ui-consumer.config.ts
npx tsc --noEmit -p apps/docs/tsconfig.app.json
NX_DAEMON=false npx nx run-many -t lint
```

Run builds before browser tests, and run the consumer modes sequentially (shared port 4201).

## Standards

One P1 found in the initial fix: a one-shot resizer measurement duplicated the existing measurement owner and was timing-sensitive. Removed it; CSS now lets the established ResizeObserver measure the actual layout box. The reviewer confirmed closure. **0 open findings.**

## Spec

The independent reviewer inspected the diff and comparative sheets for all 53 inline scenes. Missing presentations, labels, centered text, frames and geometry are covered. **0 open findings.**

## Screenshots

[Overview before](visual-regressions/overview-before.png) · [Overview after](visual-regressions/overview-after.png)

[Cards before](visual-regressions/cards-before.png) · [Cards after](visual-regressions/cards-after.png)

[Normal and custom groups](visual-regressions/groups-after.png) · [Pipeline ports and endpoints](visual-regressions/pipeline-after.png)
