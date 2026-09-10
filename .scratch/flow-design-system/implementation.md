# Implementation checkpoint

Status: in progress. The complete seven-stage plan is **not finished**; default presentations
and appearance APIs have deliberately not been removed before the acceptance gate.

## Implemented

- New ng-doc Design system category, overview and five working composition pages. The old
  `/introduction/design-system` route redirects to the overview. Demo source remains visible.
- Shared card/field/port/container anatomy, toolbar and external-label parts. Status tone and
  activity are independent of diagnostics, selection and action availability; reduced motion
  and forced colors have explicit rules. No business model, forms engine or plugin registry.
- Exactly the agreed shared UI tokens, scoped UI→core mappings and no global theme installation.
  Component-specific MVP tokens replaced with ordinary CSS selectors.
- `styles.css` and self-contained `styles.source.css`, assets/exports/sideEffects, one Angular
  package build. CSS parity test processes the published source with Tailwind CLI and compares
  browser computed styles against compiled CSS; consumers need no Tailwind dependency.
- Explicit-instance viewport controls, native buttons/custom projection, localizable labels,
  public read-only `VflowComponent.zoomRange`, matching testing mock and real core peer dependency.
- Separate `@vflow/ui/bpmn` entry point, built through ng-packagr: task, start/end, XOR/parallel,
  pool/lane and sequence/message/association presentations using public base primitives.
- Five compositions: branched workflow with two source ports and simultaneous diagnosis/status;
  media pipeline with native image/range and typed labeled ports; ERD rename/reorder/delete;
  read-only metrics map with container-owned connection and portless note; BPMN subset.
- Canvas CSS resolution isolated from geometry. Attribute changes on the editor/ancestors
  refresh the palette automatically; `MiniMapComponent.refreshTheme()` handles external
  stylesheet/media changes. Legacy explicit background colors remain a compatibility path.
- Scoped SVG marker IDs fix cross-editor theme collisions for identical marker specifications.
- [Appearance inventory](appearance-inventory.md) records the remaining coordinated removal.

## Verification artifacts and commands

- [Baseline](baseline.json), [after](after.json), [measurement script](measure.mjs).
- [Scroll results](scroll-results.json), [experiment script](scroll-experiment.mjs).
- [Isolated tarball consumer check](check-consumer.mjs) for Angular 20.0.0 / TS 5.8.3 and
  Angular 21.0.0 / TS 5.9.3. Separate core-only and UI bundles; no Tailwind consumer dependency.
- `NX_DAEMON=false npx nx build ui`
- `CHROME_BIN="$(node -e "console.log(require('@playwright/test').chromium.executablePath())")" NX_DAEMON=false npx nx test ngx-vflow --watch=false --browsers=ChromeHeadless --progress=false`
- `NX_DAEMON=false npx playwright test -c apps/docs-e2e/playwright.config.ts --workers=1 --reporter=list`
- `E2E_CONFIGURATION=hybrid` selects distribution JS + compiled CSS; `hybrid-source` selects
  distribution JS + source CSS. Stop any pre-existing :4200 development server before switching.

### Results (2026-09-10)

- Core + UI/BPMN production package build: passed. Docs development and production builds:
  passed; production retains the repository's third-party CommonJS warnings.
- Core unit tests: **217 passed**. UI/core/docs lint: passed.
- Full Chromium docs suite in source-development mode: **27 passed**. After the final BPMN
  framing/layering adjustment, its interaction and two-theme accessibility tests also passed.
- Axe audits cover all five compositions in both themes. Tests wait for NgDoc's route fade to
  finish, rather than auditing intermediate page opacity.
- Color-only theme switch: instrumented node/handle `getBoundingClientRect` calls remain zero
  in the six-node multi-editor fixture. Minimap changes and marker isolation are checked too.
- Isolated npm tarballs: Angular **20.0.0 / TypeScript 5.8.3** and **21.0.0 / 5.9.3** both pass
  `ngc` and Chromium runtime smoke. Separate core-only bundle contains no UI; compiled/source
  CSS render identically and the consumer has no Tailwind dependency. This is a basic consumer
  compatibility smoke, not the complete browser suite on every Angular minor.
- An initial full-suite run had a transient minimap resize-navigation failure. Five isolated
  repeats and the final full-suite run passed without a minimap gesture change; do not claim
  this establishes a zero-flake rate.

- Final distribution-JS + compiled-CSS mode (`hybrid`): **15 Chromium checks passed**.
- Final distribution-JS + source-CSS mode (`hybrid-source`): **15 Chromium checks passed**.
  Both include composition interactions, five two-theme Axe audits, theme/marker/canvas isolation,
  no-remeasurement instrumentation and published CSS parity.
- Latest rebuilt tarballs repeated both Angular 20.0.0 and 21.0.0 consumer checks successfully.
- Prettier on changed files and `git diff --check`: passed. No release or version bump performed.

None of these results substitutes for the remaining production matrix or authorizes stage-7 removal.

## Performance interpretation

Same Chromium 153, Apple M1 Pro, 1280×900, five samples of the existing four-node / ten-field /
two-edge ERD scene. Median zoom frame interval remained 16.7 ms; p95 remained 16.7–16.8 ms.
The diagnostic waits two frames for theme/density changes (roughly 23–34 ms), so it is not a
CPU-work profiler or evidence of a throughput improvement. Demo DOM increased 173→186 because
controls and experiment wrappers were added. Moving the scene to its own page also removes
two unrelated mounted demos; this limits the comparison.

This is a reproducible small-scene smoke baseline, **not** the proposed 100×20 / 200-edge capacity
check and not an agreed numerical performance budget. Larger-scene profiling and budget
agreement remain before calling production acceptance complete.

## Scroll/collapse result

Real wheel input scrolls the local list without moving the graph camera (`vflowNoWheel`). At
zooms 0.855615 and 0.713012, 24 px list scrolling separates the row center from its SVG endpoint
by 20.535 px and 17.112 px respectively. The port itself also stops following the row; simply
checking edge-to-port alignment would miss the problem. Both edges and all ten field IDs stay
mounted. Collapse hides rows while retaining the old path; expand restores alignment in this
fixture. Large error numbers while collapsed represent zero-sized hidden DOM, not visible
endpoint precision. No projection to header/boundary and no library scroll API were added.

## Remaining before stage 7

- Finish the full geometry/token acceptance matrix, including typography changes, long
  labels and first-frame endpoints beyond the existing core stress and row-alignment tests.
  Color-only measurement instrumentation is now present, but only for the small multi-editor fixture.
- Review the local scroll/collapse experiment with the user; no automatic hidden-endpoint
  policy or universal scroll support has been added.
- Finish public core feedback selector promotion and all appearance replacement details from
  the inventory; do not expose arbitrary internal DOM accidentally.
- After that gate, carry out stage 7 together: types/create helpers/NodeModel/default handles,
  optimized branches, minimap, testing mocks, all docs consumers, default presentation removal,
  appearance input removal, both working migration paths and final repeat acceptance.
