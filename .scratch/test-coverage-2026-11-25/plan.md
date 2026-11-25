# Test coverage: research, plan, work packages (2026-11-25)

## 1. What comparable libraries do

Read from their repositories (trees, configs, CI): xyflow, vue-flow, Foblex f-flow, ngx-graph, rete + rete-qa, JointJS,
maxGraph, ng-diagram, excalidraw, tldraw.

| Practice                                                                                     | Who                                                                                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Fast unit tests of geometry, utils, stores                                                   | all                                                                                              |
| Component tests in a real browser                                                            | xyflow and vue-flow (Cypress component), f-flow (Karma)                                          |
| E2E with real pointer input on a harness or example app, with a gesture helper / page object | xyflow, f-flow, rete-qa, ng-diagram, tldraw                                                      |
| CI on Linux only, chromium, `retries: 2`, trace kept on failure                              | most                                                                                             |
| Screenshot tests                                                                             | only rete-qa (44 per browser) and tldraw (~75); baselines on Linux only, a workflow updates them |
| axe on the canvas                                                                            | none (ng-diagram runs axe on its landing only); keyboard/focus e2e in xyflow, ng-diagram, tldraw |
| Coverage thresholds                                                                          | JointJS, excalidraw                                                                              |
| SSR specs                                                                                    | f-flow                                                                                           |
| Type-level tests                                                                             | JointJS, maxGraph                                                                                |
| Performance tests                                                                            | rete, rete-qa, tldraw, f-flow (one spec)                                                         |

De-facto standard: unit tests for pure code, browser tests for interaction, e2e on real pages with gesture helpers,
Linux CI with retries. Screenshots are the exception, kept small and pinned to one OS.

## 2. Where we are

- Core: 76 spec files, 540 tests in Chromium (Vitest browser mode); 95.5% lines, 94.3% branches. Also node-dom (jsdom,
  happy-dom, with and without zone.js) and server specs.
- routing 94.7% / 90.7%, auto-size 100% / 85.4%, layout 99.0% / 95.4% (lines / branches). cli: 53 tests, not measured.
- E2E: 18 Playwright files, 57 tests against the docs dev server.
- Missing before this work: coverage measurement, a check of the prerendered production site, a rule set for tests.

Coverage is already high, so the work is mostly making the tests conform, closing the listed gaps and trimming e2e to
what only a page can prove.

## 3. Rules every test follows

1. Behavior through the public API or the rendered DOM. No private access (`as any`, bracket access, casts to reach
   protected members), no assertions on internal services/models when the DOM, an output or a public method shows the
   same thing, no spies on internals of the unit under test.
2. Would fail if the behavior broke. No vacuous or conditional assertions (`if (x) expect`), no test of Angular or
   TypeScript itself. Type assertions (`expectTypeOf`, `@ts-expect-error`) are real checks here, because the `test`
   target runs `tsc -p tsconfig.spec.json`; keep them, but in a test that says it checks types.
3. Deterministic. No `setTimeout`/sleep waits: use `await fixture.whenStable()`, `vi.waitFor`/`expect.poll`, fake timers
   (`vi.useFakeTimers`) or an event of the thing awaited. No wall-clock thresholds.
4. One behavior per test, named by it. Tables are `it.each`, not loops with assertions inside.
5. A test lives in the spec of its subject. No grab-bag files.
6. No duplicates, no dead helpers, no skipped tests.
7. Mocks only at real boundaries (ResizeObserver, timers, clipboard, network), not internal services.
8. E2E: web-first assertions, no `waitForTimeout`, role/label/test-id or `data-v-*` locators (the DOM contract of the
   library), never Tailwind classes or `.v-*`/`.vui-*` internals, nothing a component test already proves.

Deleting a test is right when it is a duplicate, vacuous, or checks an implementation detail whose behavior another
test covers. Otherwise rewrite it.

## 4. Infrastructure

Done before the packages:

- `@vitest/coverage-v8`; `coverage` configuration of the `test` targets, `pnpm test:coverage`; reports in `coverage/<lib>`.

Done by packages:

- E2E fixture (`apps/docs-e2e/fixtures.ts`): `test` that fails on page errors and console errors, a `goto` that waits
  for the flows of the page to start (needed on a prerendered page), gesture helpers shared by the specs (WP-I).
- Smoke of every page against the dev server and against `pnpm preview`, the prerendered build (WP-J).
- Coverage thresholds in the shared config, set after the packages land.

Decided against, for now:

- Screenshot tests. Two of ten libraries have them; baselines must come from the CI OS (Linux), and there is no way
  to produce them here. A follow-up, with an update workflow, once the release is out.
- A separate harness application for e2e. The docs demos are the pages users see, and the component tests already run
  in a browser; a harness would duplicate them.
- Cross-browser e2e. Chromium only, like most of the field.

## 5. Work packages

Rules for every package: edit only the files the package names (new spec files next to their subject are allowed);
never commit; do not change library sources unless a test proves a bug (then report it, do not fix silently); read a
file as it was before this work with `git show HEAD:<path>`. Run only your own specs:
`cd libs/<lib> && pnpm exec vitest run <files>`; then `pnpm exec tsc -p tsconfig.spec.json --noEmit` (errors in files of
other packages are theirs) and `pnpm exec eslint <files>`, `pnpm exec prettier --write <files>` from the repo root.

Paths below are under `libs/ngx-vflow/src/lib/vflow/` unless they start with `libs/` or `apps/`.

### WP-A core flow specs (opus)

Files: `audit-regressions.spec.ts`, `css-virtualization.spec.ts`, `initial-handles.spec.ts`, `initial-viewport.spec.ts`,
`components/background/*`, `components/edge-label/*`, `components/edge/*`, `components/defs/*`, and in
`components/vflow/`: `vflow.component`, `provided-*`, `settings-inputs`, `curve-factory-params`, `changes-outputs`,
`click-selection`, `portal`, `connection-outputs`, `content-layer`, `initialization-gate` specs.

- `audit-regressions.spec.ts` is a grab bag: delete the file. Its tests: delete the duplicates (edge selection change,
  detached for one of two edges, culls an already-measured edge, crossing paths with offscreen endpoints); move the
  rest to their subject, rewritten through a real flow where they build models by hand. Tests whose subject belongs to
  another package are taken by that package (WP-C: connection.service, node.model, edge.model; WP-D: resizer min size;
  WP-E: graph-operations reparent) — do not move those, just delete the file at the end.
- `css-virtualization`: no spies on protected `trackNodes`/`trackEdges`, no driving of internal services; read the DOM;
  the minimap test goes to WP-D (leave it out); no 400 ms sleep; split multi-behavior tests.
- `initial-handles`: no `AfterRenderBatchService`/`DraggableService` driving, no conditional assertion.
- `initial-viewport`: split the `fitView` limits test by behavior.
- `background`: wait for the image `error` event, not 50 ms.
- `edge-label`: count hosts in the DOM, not `labelTemplates()`; the SVG-namespace test must assert the library output.
- `provided-settings`, `settings-inputs`, `provided-accessibility`, `provided-shortcuts`: assert through `flow.settings`
  or behavior (key presses, attributes), not internal services; delete `binds every setting, with the defaults`.
- `provided-components`, `provided-curves`: type tests say so and use `expectTypeOf`; read the path `d` from the DOM.
- `changes-outputs`: no 60 ms `settle`; node changes are delivered by a 25 ms timer, so fake timers.
- `click-selection`: the edge hit-area test belongs to `components/edge/component-edge.spec.ts`, without the duplicates.
- `portal.spec.ts` moves to `components/portal/`; split its three-behavior test.
- `vflow.component`: the grid snap assertion must be exact; drag events and snapping are two tests.
- `component-edge`: `By.directive` in place of static `instances`, no `setTimeout(0)`.

### WP-B core interaction specs (opus)

Files in `components/vflow/`: `viewport-gestures`, `auto-pan`, `keyboard-navigation`, `accessibility` specs.

- `viewport-gestures`: move the programmatic viewport API tests to a new `viewport-api.spec.ts`; no `pause(100..500)`,
  no `afterEach` pause, no `ViewportService` internals (use the outputs); split multi-behavior tests; press the real
  node, not a fabricated `span[data-v-node]`; drop the redundant dynamic imports.
- `auto-pan`: no sleeps in `setup`/`frame()` (the clock is mocked); remove the duplicate `boolean true` test and the
  dead `view` input; the real-frames test must not wait on wall clock.
- `keyboard-navigation`: split the giant tests into single behaviors, one shared `description()` helper, no 150 ms
  sleeps for the live region; `it.each` for the embedded controls; drop or fix the stale-focus test if it cannot fail.
- `accessibility`: split the three multi-behavior tests; `noDrag` → `vNoDrag`.

### WP-C core services, models, directives, gestures (opus)

Files: all specs in `services/`, `models/`, `directives/`, `gestures/`, `features/`.

- Delete `services/edge-changes.service.spec.ts` (duplicate of changes-outputs). Delete the duplicates listed in the
  audit: selection.service ineligible entity, node-changes one-tick array, node.model resize/measure/lazy-load
  duplicates of resizable and outlet tests, handle.model unmeasured element.
- `draggable.service`: no `(service as any).dragFilter` — press the element and assert no drag starts; no call-count
  assertions on mocked internal services; split multi-behavior tests.
- `connection.service`: split the multi-phase tests, `it.each` for the loop with `if`. Take from
  `audit-regressions.spec.ts`: `validates release once regardless of subscriber count and completes reconnect without
listeners` (two tests, through outputs).
- `handle.model`, `edge.model`: real elements measured by the browser, not faked rectangles; the five `should detached`
  tests become one `it.each` with real names; factory tests move to `interfaces/*.spec.ts` (WP-E owns those files: put
  them in a new `models`-side test only if they test the model, otherwise delete and tell WP-E in your report).
  Take from audit-regressions: `updates an edge between auto handles with offscreen endpoint` and `stops observing a
model after the node is removed`.
- `node-changes`: fake timers, not a 30 ms wait.
- `selection-box-context`, `node-handles-controller`: rewrite through a real flow and the DOM (`data-v-selected`; a
  keyed `@for` reorder of handles updating the edge); delete the mock-order test.
- `zoom-interpolation`: wheel and viewport-transform tests move to `wheel.spec.ts` and `viewport-transform.spec.ts`;
  loops → `it.each`. `pointer-drag`, `keyboard.service`: split; the blur check must first prove the key was active.
- `provide-vflow`: the type test says it checks types.

### WP-D core public components and directives (opus)

Files: all specs in `public-components/` and `public-directives/`.

- `resizable.component`: no private `--_gap`, no writes to model fields (hold a real drag); delete the two duplicates.
  `resizer.spec`: real `NodeModel`, `it.each`; take `grows a node that starts below its min size` from audit-regressions.
- `minimap-navigation`: split the giant tests, fake timers for the 200 ms wait. Take the minimap test of
  `css-virtualization.spec.ts` (`draws the minimap with SVG…`), split by behavior.
- `minimap-node-style`: assert the rendered fill, not `VFLOW_MINIMAP_SETTINGS`.
- `handle.directive`: start connections with the pointer, reach states by hovering, outputs not `DraggableService`;
  `emits connectEnd…` moves to WP-A's `connection-outputs.spec.ts` — leave it, report it.
- `node-toolbar`: `it.each`, cleanup in `afterEach`.
- New tests (gaps): `vResizable` min/max width/height limiting a real drag, `resizeAxis`, `keepAspectRatio`,
  `[vResizable]="false"`, `autoScale=false`, a parent that cannot shrink below `extent: 'parent'` children, resize from
  top/left moves the node point; `vHandle` `offsetX/offsetY`, `canStart=false`/`canAccept=false` with a real gesture,
  `position="auto"` in a flow; a press inside `v-node-toolbar` does not drag the node. `resizer-utils.ts` is 53% covered.

### WP-E core utils, math, interfaces, node-dom, server (sonnet)

Files: specs in `utils/`, `math/`, `interfaces/`, `libs/ngx-vflow/node-dom/`, `libs/ngx-vflow/server/`.

- Split: `utils/nodes`, `utils/graph-operations` (remove the two overlaps), `utils/coordinates` (assert a known mapped
  value, separate RangeError test), `allow-root-zoom-for-node-target` third test, `node-dom/flow` last test.
- `utils/batch-changes`: no spy on `asyncScheduler`, no 5 ms sleep.
- `math/edge-path/edge-path.spec.ts` is a grab bag: one spec per path function; remove the duplicate angle test and
  the weak label-order test in `smooth-step-path`.
- `utils/alignment`: replace the 300-run random loop with fixed cases.
- Take from audit-regressions: `preserves rendered position when reparentNodes adds an omitted parentId signal`
  (into graph-operations).
- New tests: `utils/with-defaults`, `same-connection`, `add-nodes-to-edges`, `svg-path-bounds`, `rect`, `get-os`,
  `utils/signals/*`, `math/edge-path/resolve-curve`, `bezier-path` branches, `smooth-step-path` uncovered branches,
  `point-on-line-by-ratio`, `direction-angle`; `createNode(s)`/`createEdge(s)` defaults in `interfaces/*.spec.ts`
  (those files are 52–58% covered).

### WP-F routing, auto-size, layout (sonnet)

Files: specs in `libs/routing`, `libs/auto-size`, `libs/layout`.

- routing: delete the wall-clock test; assert the path, not the `isObstacle` call set; a real connection-mode params
  object, not `as never`; split the jitter test.
- auto-size: remove the dead cast lines.
- layout: one spec per adapter; fake timers in the force and animation tests; split the `runs again` test.
- New tests: `node-animator`, a custom `VX_LAYOUT_POSITION_WRITER`, adapter behavior on an empty graph and a cycle,
  auto-size uncovered branches (85%).

### WP-G cli (sonnet)

Files: specs in `libs/cli`.

- Split the multi-behavior tests; valid parses out of the `refuses` test; `compat.spec.ts` next to `ui/compat.ts`;
  remove the overlaps between `generator.spec.ts`, `tokens.spec.ts`, `ngx-vflow.spec.ts`.
- New tests: `bin/vflow.ts` dispatch and exit codes, `utils/install.ts`, `utils/applications.ts`, `utils/jsonc.ts`.

### WP-H new core component coverage (opus)

New spec files only (do not edit existing specs):

- `components/connection/`: the connection line during a drag (default path, `ng-template[vConnection]` and its
  context, `connection.curve`, `markerEnd`).
- `components/selection-box/` (or next to it): the rendered rectangle during a drag, `selectionBoxMode` `partial` vs
  `full` deciding which nodes are selected, edges, adding with the modifier if supported.
- `components/alignment-helper/`: rendered guides during a drag, removed on release, Alt bypass (31% covered).
- background: grid/dots spacing following zoom and pan, a loaded image, `background: null`.
- `--v-zoom` at gesture end; filtered outputs `nodesChanges.size/.select`, `edgesChanges.select`; reconnection from the
  source end; edge label `data-v-pending`; `edgesFocusable`; default edge template `marker-start/end`.
- Listeners released after destroy (keys and gestures do nothing); two flows on one page do not share shortcuts and
  gestures.

### WP-I e2e rework (opus)

Files: `apps/docs-e2e/*` existing specs, new `apps/docs-e2e/fixtures.ts`.

- The fixture of section 4; every spec imports `test`/`expect` from it. Shared `flowPoint`/drag helpers there.
- Delete what component tests prove: `minimap-navigation` except one real-touch tap; `alignment-helper` except one
  drag-shows-guides test; `auto-size` except one drag; `stress-rendering`; the edge hit-test of
  `custom-edge-interactions`; wheel/pan/pinch duplicates of `viewport-gestures`; `layout` except a direction toggle;
  the min-width test of `resizer`; the anatomy figure, image-lab layout and DOM-mutation geometry tests of
  `design-system*`.
- Split the giant tests of `design-system`, `easy-connect`, `recipes`, `pointer-interactions`, `keyboard-shortcuts`
  (axe apart).
- No `waitForTimeout`; `expect.poll`/`toPass` for geometry; no `.v-*`, `.vui-*`, Tailwind or `nth` selectors where a
  role, label, test id or `data-v-*` exists (add a `data-testid` to a demo when nothing else identifies it).
- Fix the two known failures (ERD add field: stale coordinates; easy-connect: reading before the layout settles).
- Run: `pnpm e2e` from the repo root (it starts the dev server).

### WP-J e2e smoke and journeys (sonnet), after WP-I

New files in `apps/docs-e2e`, using the fixture:

- `smoke.spec.ts`: every page of the site loads with no page or console error and every flow starts with nodes.
  Against the dev server, and against the prerendered build (`E2E_BASE_URL` pointing at `pnpm preview`): there also
  `#ng-state` present and layout shift below 0.1.
- Journeys no test has: keyboard only (focus a node, move, delete), client-side navigation between two pages with
  flows leaves no error, light/dark theme switch changes a core demo, connection validation states while dragging.
- `apps/docs-e2e/project.json` target for the preview run; a CI step in `.github/workflows/ci.yml`.

## 6. Order

Batch 1 (parallel): WP-A, WP-B, WP-C, WP-D, WP-E. Batch 2: WP-F, WP-G, WP-H, WP-I. Then WP-J. Then: full `pnpm test`,
`pnpm e2e`, coverage against the baseline, thresholds.
