# Implementation checkpoint

Status: in progress. The complete seven-stage plan is **not finished**. Per the user's
2026-09-10 correction, appearance APIs are removed in favor of CSS custom properties,
including part variables. Default presentations remain behind their separate acceptance gate.

## Implemented

- New ng-doc Design system category, overview and five working composition pages. The old
  `/introduction/design-system` route redirects to the overview. Demo source remains visible.
- Shared card/field/port/container anatomy, toolbar and external-label parts. Status tone and
  activity are independent of diagnostics, selection and action availability; reduced motion
  and forced colors have explicit rules. No business model, forms engine or plugin registry.
- Shared UI tokens, scoped UI→core mappings and no global theme installation. Part-specific
  CSS variables now supplement shared tokens; classes are NOT public styling API (ADR-0007).
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
  stylesheet/media changes. Legacy background/minimap color APIs are removed.
- Scoped SVG marker IDs fix cross-editor theme collisions for identical marker specifications.
- [Appearance inventory](appearance-inventory.md) records the completed appearance migration
  and the still-pending default-presentation removal.

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

### Historical results before the CSS-only appearance migration (2026-09-10)

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

None of these results substitutes for the remaining production matrix or authorizes
removal of default presentations.

## Current continuation: CSS-only appearance (2026-09-10)

The user rejected public styling classes and explicitly chose part-specific variables and
removal of programmatic appearance inputs. [ADR-0007](../../docs/adr/0007-css-custom-properties-for-appearance.md)
supersedes the earlier selector/no-component-token decision; plan, contract and inventory
are updated. The prior selector-promotion attempt is withdrawn.

- Removed resize color inputs, minimap mask/stroke inputs, guide and selection-box color
  fields, background color shorthand/fields and dot-size/grid-stroke fields, marker
  color/stroke/size fields, default-group color and default-label style. Updated templates,
  types, NodeModel/create helpers, testing mocks and all affected docs consumers.
- Added core part variables for resize, guides, selection box, backgrounds, markers,
  minimap, default groups and labels; UI part variables for cards, fields, groups, ports,
  statuses, edges, buttons and BPMN. Fallbacks occur at usage sites, not on intermediate hosts.
- Marker scale transforms the shape around its attachment point with visible overflow;
  original type/orientation/units and scoped URL wiring remain. The migration guide explains
  old width/height conversion and the custom-SVG path for clipping/per-edge presentation.
- Canvas continues to resolve CSS colors, refresh automatically on ancestor attributes,
  and expose explicit refresh for stylesheet/media changes. No appearance compatibility
  branch remains. DOM inheritance boundaries (including sibling core resize controls) are
  explicitly documented; no automatic copying of card-local variables was introduced.
- Added `/design-system/styling` with the variable catalogue and core-only/UI migration
  examples. Updated existing resizer, background, selection-box, label and minimap docs.
- Regression tests cover compile-time rejection of removed fields, production/mock input
  parity, inherited part overrides, fallback restoration, SVG zoom behavior, marker scale,
  multi-editor isolation, canvas refresh and zero color-only node/handle measurements.
- The existing viewport reconciliation tests caught a real interim regression: reading
  zoom in the background component's host binding subscribed the parent flow view. Moving
  that binding inside the background template fixed it; no tests were weakened.

### Current verification

- **225 core unit tests passed** in Chromium. UI/core/docs lint passed.
- Core + UI/BPMN package builds and docs production build passed (existing third-party
  CommonJS warnings remain).
- Full source-development Chromium docs suite: **28 passed**.
- Rebuilt distribution JS + compiled CSS (`hybrid`): **15 passed**.
- Rebuilt distribution JS + source CSS (`hybrid-source`): **15 passed**.
  Both include the five two-theme Axe audits, composition interactions, theme/marker/canvas
  isolation, no-remeasurement check and published CSS parity with part-variable overrides.
- Latest tarballs: Angular **20.0.0 / TS 5.8.3** and **21.0.0 / TS 5.9.3** both pass
  `ngc` and Chromium runtime smoke. Core-only remains separate; CSS modes match without a
  Tailwind consumer dependency. This remains a smoke, not every Angular minor's full suite.
- Prettier and `git diff --check` passed. No version bump or release performed.

Default presentations, the larger-scene production gate and scroll/collapse policy remain
unfinished. Appearance migration does not imply completion of all seven stages.

## Pipeline positioned-anchor fix (2026-09-10)

- User reported pipeline handles below their nodes. Reproduced 119–164 px row-to-handle
  errors; the new Playwright `pipeline handles` check failed at 164.255 px. Prior controls
  checks did not assert row alignment, so their success had missed this defect.
- Cause: custom-handle CSS insets were expressed in node space even when a positioned
  row/card was the actual CSS containing block, adding its offset twice. `HandleModel`
  now converts only CSS insets to the containing block's padding-box coordinates (including
  borders and current scroll offset), while graph endpoint coordinates remain in node space.
  No CSS workaround in the pipeline demo, new public API, or scroll-observation policy.
- Regression coverage: positioned/bordered custom anchors on all four sides at zoom
  1 / 0.5 / 1.5, graph-endpoint agreement, and all five pipeline ports through zoom limits,
  theme switch and native slider interaction.
- Verification after fix: **226 core tests**, **29 full Chromium docs checks**, core lint
  and core + UI/BPMN build passed. Distribution-mode/isolated-consumer results above predate
  this fix and were not repeated in this follow-up.

## DOM-first handle prototypes — target approved, integration isolated

- User requested a throwaway prototype after the [competitor/source research](handle-placement-research.md),
  then approved DOM-first placement. [Standalone observations and archive](handles-dom-first-prototype.md);
  [real Angular follow-up, run instructions and remaining gates](angular-dom-first.md).
- Simplified HTML replicas of simple nodes, pipeline and ERD compare measured DOM-port endpoints
  with ghost node-boundary projections. Includes four sides, nested rows, borders/port size,
  rename/reorder/delete, camera/color changes and explicit scroll/collapse experiments.
- Chromium smoke: endpoint/DOM discrepancy rounded to 0.000 screen px for all three scenes at
  zoom 0.5 / 1 / 1.5. Unobserved 45 px scroll at zoom 0.8 produced 36 px stale-cache error;
  explicit refresh restored agreement. These are prototype results, not production acceptance.
- Source archived on local branch **`prototype/dom-first-handles`**, worktree
  `../ngx-vflow-dom-first-prototype`, integration commit **`162e2db7`**.
  Baseline **`d5a5c4ca`** preserves the original checkout's
  existing changes and standalone prototype; subsequent changes are the real Angular experiment.
- Isolated integration: custom handles read their own DOM box; CSS provides side defaults.
  Pipeline requires no consumer layout change; ERD adds `position: relative` to the shared UI field.
  Existing batching, readiness, interactions and built-in default presentations remain.
- Real pipeline/ERD geometry, row insets, zoom, rename/reorder and magnetic connection recreation
  work in the sampled checks. Core/UI builds and core lint pass. Tests remain honest: 219/226 core
  checks and 3/4 relevant docs checks pass; five unit failures expect inline positioning, two expose
  a constrained-resizable extra-frame sync difference; the docs failure is page scrolling on focus.
- Main-tree production code/ADRs were not migrated. Before adoption, resolve resizable synchronization,
  migrate behavior-level tests and repeat broader acceptance. Hidden-port policy is still unresolved.

## DOM-first promotion to the working branch (2026-09-10)

- User approved the real Angular scroll/collapse behavior and requested transfer into
  `new-design-system-pi`. Imported the tested core/UI/demo changes, preserving unrelated
  worktree changes and keeping the standalone archives / prototype launch scripts separate.
  The earlier positioned-anchor compensation is superseded, not maintained as a second mode.
- Custom handles use CSS containing-block placement and measured DOM boxes. Native scroll
  participates in the existing per-node batch; `refreshNodeHandles(nodeIds)` explicitly
  invalidates geometry after application-owned position-only DOM writes.
- Entities keeps persistent port anchors outside clipped/hidden rows and owns boundary/header
  docking. Synthetic scroll is removed; UI controls are now **Scrollable fields** and
  **Collapse fields**. This is a small-field-set recipe, not universal field virtualization.
- [ADR-0008](../../docs/adr/0008-dom-first-handle-geometry.md) updates the placement decision;
  migration/custom-handle/Entities docs explain the changed contract. The original prototype
  observations above are historical. [Detailed follow-up](angular-scroll-collapse.md).
- Migrated old inline-placement assertions to actual DOM/SVG geometry, including first visible
  frames and cull/restore. The two resizable failures were premature one-frame assertions:
  native ResizeObserver/model rendering converges a frame later. Tests now wait for expected
  geometry within a bounded frame budget; resizable runtime code did not change.
- Verification on the destination working tree: **230 core unit tests**, **all 30 Chromium
  docs tests**, core/UI lint, and core/testing/UI/BPMN development builds passed. Distribution
  browser modes and isolated Angular-version consumers were not repeated in this promotion.
- No commit, version bump, release, default-presentation removal or large-scene acceptance claimed.

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
- Finish the remaining core feedback variable review (focus, selection, basic handles and
  connection preview). Do not promote implementation classes; part appearance uses CSS
  variables. The inventory's programmatic appearance fields have now been removed.
- After that gate, carry out stage 7 together: types/create helpers/NodeModel/default handles,
  optimized branches, minimap, testing mocks, all docs consumers, default presentation removal,
  both final headless migration paths and repeat acceptance. Appearance input removal has
  already been completed independently by explicit user request.
