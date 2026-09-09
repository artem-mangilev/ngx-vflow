# Implementation checks

Follow-up: the user reported visual regressions missed by this functional acceptance. See [the visual regression audit](visual-regressions.md) for the corrections and expanded checks.

Baseline: `1c3e2d06056a329d78910eba1e57d6a300936ec0`, 2026-09-09.

`NX_DAEMON=false npx playwright test -c apps/docs-e2e/playwright.config.ts apps/docs-e2e/design-system.spec.ts --workers=2 --reporter=line`: **3 passed** (27.1s), before primitive changes. Workflow actions/themes, field geometry and reconnection, BPMN/forced colors.

Before core migration: docs Chromium checks **6 passed** (5.5s); scroll/collapse and view-only map **2 passed** (2.7s). Built-package consumer with compiled CSS + axe **1 passed** (6.8s); source CSS + axe **1 passed** (5.7s). `nx build ui-consumer --configuration compiled` builds core, UI and BPMN together. TypeScript checks passed for core, UI and docs.

Scroll experiment: DOM/field IDs and edges survive collapse, deletion explicitly removes incident edges. Native overflow does not update endpoints reliably; after expand at increased zoom one run measured 1.671 px row/port deviation. This is a recorded limitation, not a library support guarantee. View-only dragging pans the camera while relative node positions stay fixed.

## Final API acceptance

All seven implementation stages are complete. Default node/group/edge/label presentations and appearance inputs have been removed from core. The appearance inventory and migration guide describe their replacements; behavioral geometry inputs remain. No version bump or publication was performed; the existing release process owns the major release.

Verified on 2026-09-09:

| Check                                     | Result                                                                |
| ----------------------------------------- | --------------------------------------------------------------------- |
| Full unit suite, ChromeHeadless           | 213 core + 1 docs passed                                              |
| Full docs Playwright suite, Chromium      | 20 passed (58.6s)                                                     |
| Built-package consumer, compiled CSS      | 2 passed (6.7s)                                                       |
| Built-package consumer, source CSS        | 2 passed (7.1s)                                                       |
| Built-package consumer, core only         | 2 passed (4.4s)                                                       |
| Angular 20.3.30                           | Core/UI/BPMN package builds and all consumer modes passed             |
| Angular 21.2.22, isolated tarball install | Compiled/source/core production builds passed, no Tailwind dependency |
| TypeScript                                | Core/UI package compilation and docs standalone typecheck passed      |
| ESLint                                    | All four configured projects passed                                   |
| Standards / Spec review                   | 0 open / 0 open; see `review.md`                                      |

Browser checks cover long field names, font-size and density changes, stable rename/reorder IDs, actual SVG endpoints, valid/invalid connection feedback, resize, first-frame rendering, native controls, disabled actions, selected/diagnostic/activity combinations, keyboard behavior, forced colors and reduced motion. The consumer checks editor-local marker IDs, HTML/SVG/toolbar/canvas theme changes, retained accent overrides, unchanged node geometry after color changes, core-only feedback and axe accessibility. Axe's document-region rule is excluded because the fixture embeds multiple independent scenes; other rules run normally.

The full-suite migration initially exposed old test selectors and fixed-geometry assumptions from removed defaults. Fixtures now supply explicit presentations; asynchronous custom-handle measurement is awaited where required. Existing locality/virtualization assertions remain. The migration guide's template interpolation is escaped for ng-doc rendering.

### Reproduce

From the repository root, with installed workspace dependencies and Chromium/Chrome available:

```sh
NX_DAEMON=false npx nx build ui
NX_DAEMON=false npx nx run-many -t test --watch=false --browsers=ChromeHeadless --parallel=1
NX_DAEMON=false npx playwright test -c apps/docs-e2e/playwright.config.ts --workers=2 --reporter=line
UI_CSS_MODE=compiled NX_DAEMON=false npx playwright test -c apps/docs-e2e/ui-consumer.config.ts
UI_CSS_MODE=source NX_DAEMON=false npx playwright test -c apps/docs-e2e/ui-consumer.config.ts
UI_CSS_MODE=core NX_DAEMON=false npx playwright test -c apps/docs-e2e/ui-consumer.config.ts
node apps/ui-consumer/verify-angular21.mjs
npx tsc --noEmit -p apps/docs/tsconfig.app.json
NX_DAEMON=false npx nx run-many -t lint
```

Run consumer modes sequentially: they share port 4201. The Angular 21 script packs the built libraries, creates an isolated temporary workspace, installs Angular 21 and builds all three modes. It logs the workspace path for inspection; no generated dependencies are committed.

Scroll/collapse remains an explicitly limited demo experiment, as agreed. Firefox/WebKit, performance budgets and BPMN execution/model validation are outside this acceptance scope.
