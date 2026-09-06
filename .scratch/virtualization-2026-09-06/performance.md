# Virtualization pan/zoom diagnosis — 2026-09-06

`display: none` retained component state and reduced layout/paint, but camera changes still invalidated thousands of Angular consumers. The root viewport transform binding reconciled all graph lists on every camera update. Per-entity culling computations propagated camera invalidation to hidden views and render effects; culling host bindings also subscribed the enclosing graph template.

## Reproduction

With the demo running at localhost:4200, from the repository root:

```sh
node .scratch/virtualization-2026-09-06/profile.cjs --assert
node .scratch/virtualization-2026-09-06/profile.cjs --zoom --assert
```

The harness drives the real D3 pan/wheel path in headless Chromium, at 1440×1000, with 4900 nodes and 4899 edges. It records 65 rAF intervals after five warm-up frames and asserts p95 < 33.4 ms. The ordinary zoom sweep goes from 1 to approximately 0.68 and back. CDP CPU sampling is enabled; these are local diagnostic timings, not a browser-independent FPS guarantee. Run performance measurements without concurrent builds or other browser tests.

Optional probes: `--nodes=1000` (development only), `--all-hidden`, and `--zoom --wide-zoom` (0.1 through 3). Set `VFLOW_URL` to another served build; set `VFLOW_PROFILE=/tmp/vflow.cpuprofile` to save the CPU profile. Midpoint visibility counts are sampled once; this diagnostic sampling also contributes a little overhead.

## Measurements

| Scenario                                        | Median interval, ms | p95 interval, ms |
| ----------------------------------------------- | ------------------: | ---------------: |
| Before, development pan                         |                62.8 |             68.8 |
| Before, development zoom                        |                58.3 |             66.1 |
| Before, pan with layers additionally CSS-hidden |                63.3 |             65.0 |
| Before, pan with 2500 nodes                     |                29.7 |             33.6 |
| Before, pan with 1000 nodes                     |                12.8 |             14.1 |
| Transform binding removed, pan                  |                44.0 |             63.7 |
| Membership updates isolated, pan                |                 9.8 |             12.3 |
| Final development pan, two runs                 |           10.0–10.5 |        12.3–19.8 |
| Final development zoom, two runs                |                10.9 |        25.5–25.8 |
| Before, production pan                          |                48.7 |             56.6 |
| Final production pan                            |                 9.8 |             19.8 |

The reduced-node probes still had 30 visible nodes and 35 visible edges. Hiding the layers did not materially improve timings, while reducing hidden entities did. The original CPU profile was dominated by Angular computed polling, effect/view processing, and development `@for` duplicate-key checks. Production also failed the frame budget before the fix.

## Fix

- Apply the camera transform in an effect, outside the root graph template's reactive consumer.
- Compute viewport membership in shared node/edge rendering passes, updating each entity's boolean signal only when its membership changes.
- Apply `display` through one internal directive shared by nodes, edges, labels and toolbars. Reading culling in a template or host binding would subscribe the enclosing graph lists again.

Component instances, focus/interaction retention, initial measurement and geometry restoration remain covered by the existing integration tests. The viewport scans remain linear; no spatial index or new dependency was added.

## Limits

This does not eliminate initial mounting, DOM memory, application subscriptions, or painting visible content. The broad zoom sweep reaches 1044 visible nodes and 1015 visible edges at zoom 0.1; development p95 was 43.2 ms in that sweep. Ordinary zoom still had occasional >33 ms intervals. This change addresses the hidden-entity camera overhead, not a guarantee of 60 FPS for every graph and zoom level.

## Validation

The new regression test in `css-virtualization.spec.ts` spies on actual graph reconciliation during pan/zoom across visibility boundaries. It failed before the fix and passes afterward. Both original full-graph performance commands now pass.

- Library: 206 tests passed.
- Playwright Chromium: 9 tests passed, including state/geometry retention and keyboard accessibility.
- Production library and demo builds passed; the demo reports existing CommonJS optimization warnings.
- Library lint, formatting and diff whitespace checks passed.

The production demo build also exposed an invalid NgDoc link for `Node.preview` in the preceding documentation change; it was replaced with plain wording in the virtualization and migration pages.

## Drag follow-up

Dragging a single node reproduced a separate camera-independent slowdown. The harness now also accepts:

```sh
node .scratch/virtualization-2026-09-06/profile.cjs --drag --assert
```

It presses a visible default node, moves it over 70 frames, releases it, and checks that the node transform actually changed. The camera remains unchanged. The measurement setup and 33.4 ms p95 budget are the same as above.

| Development drag scenario                                      | Median interval, ms | p95 interval, ms |
| -------------------------------------------------------------- | ------------------: | ---------------: |
| Before, 4900 nodes / 4899 edges                                |                89.2 |             90.3 |
| Before, reduced to 1000 nodes / 999 edges                      |                19.9 |             21.3 |
| Diagnostic suppression of continuous drag-status notifications |                47.2 |             57.1 |
| Only the node transform moved out of the graph template        |                74.5 |             88.5 |
| Final, full graph, two runs                                    |           11.4–11.9 |        12.0–13.2 |

Both full-graph final runs had no measured intervals above 33.4 ms. These timings cover continuous single-node drag with 30 visible nodes; they do not benchmark initial mounting, very large multiselections, or arbitrary application drag handlers.

Two causes were fixed:

- Node coordinates, toolbar coordinates, and edge-label path points were read by the enclosing graph template. Updates now stay in their respective node/label/toolbar views. Labels without path label points still omit their content.
- Every `node-drag` status invalidated connection-related computations and effects across nodes, handles, and edges. A shared `connectionStatus` signal publishes only active connection/reconnection state from the existing status observable. Drag statuses and public drag notifications are preserved. Unlike a computed projection of the general status, this prevents drag invalidation from propagating to those consumers at all.

The expanded integration regression drives a real custom-node drag with a connected labelled edge and toolbar. It verifies live positions and path changes, absence of graph-list reconciliation and hidden-node connection updates, and start/move/end status notifications. It failed before the corresponding changes and passes afterward.

Validation: 207 library tests, 9 Chromium e2e tests, production library build, demo TypeScript check, library lint and formatting. The keyboard e2e test now waits for the accessible Escape instruction to disappear after enabling manual selection: instrumentation showed it previously dispatched Escape while the graph still had its old selection policy. No selection behavior was changed.

## Selection, connection targets, and canvas mini-map

The follow-up uses the same Chromium development build, 1440×1000 viewport,
4900 nodes, 4899 edges, and 70-frame replay (the first five intervals are omitted).
These are local measurements, not a frame-rate guarantee for arbitrary custom content.

| Scenario                                 | Before p95, ms | Final p95, ms |
| ---------------------------------------- | -------------: | ------------: |
| Alternating node selection and elevation |           48.9 |          10.5 |
| Alternating connection validation target |           77.0 |           9.7 |
| Pan with mini-map                        |           75.5 |          24.7 |
| Zoom with canvas mini-map                |              — |          27.9 |
| Drag with canvas mini-map                |              — |          32.7 |
| Pan with canvas mini-map, DPR 2          |              — |          24.9 |

The mini-map fixture starts from /viewport/minimap and installs the same
4900-node grid for every comparison. Selection/connection replays exercise the
library's selection/elevation and status services once per frame; they measure
continuous updates, not pointer hit testing or gesture startup.

```sh
node .scratch/virtualization-2026-09-06/profile.cjs --selection --assert
node .scratch/virtualization-2026-09-06/profile.cjs --connection --assert
node .scratch/virtualization-2026-09-06/profile.cjs --minimap --assert
node .scratch/virtualization-2026-09-06/profile.cjs --minimap --zoom --assert
node .scratch/virtualization-2026-09-06/profile.cjs --minimap --drag --assert
node .scratch/virtualization-2026-09-06/profile.cjs --minimap --dpr=2 --assert
```

Node/edge accessibility and z-index now update locally. The accessibility input
takes a model instead of a bare signal: Angular's development input reflection
stringifies signals, which otherwise accidentally subscribes the parent view
on the first render. A regression test caught that extra first-selection traversal.

One connection-status effect updates only departing/arriving participant nodes,
the candidate handle state, and the reconnecting edge. Handle magnets subscribe
to a boolean that changes only on connection start/end. Public status emissions
and the controller's immediate validation writes are retained.

Moving SVG mini-map geometry to local effects first reduced pan p95 to 40.4 ms,
but SVG painting remained material (CSS hiding the mini-map reduced it to 24.6 ms).
A compositor hint did not reliably meet the budget. At the user's request,
the final implementation replaces the SVG previews with a canvas. A cached graph
bitmap changes only with geometry, selection, graph membership, dimensions, or
pixel ratio; pan/zoom paints the camera region and copies that bitmap. The
rendered canvas has a backing store scaled for device pixels and retains an
accessible image name/description on its containing HTML overlay.

Graph edits still redraw all mini-map previews. The measured mini-map drag had
three of 65 intervals above 33.4 ms (max 42 ms), even though its p95 passed.
Large selections, expensive application handlers, initial mounting, and gesture
startup/teardown are not covered by the continuous-update budget.

The final ordinary graph regressions also passed: pan p95 19.7 ms, zoom 25.4 ms,
and drag 17.1 ms. Canvas integration coverage checks pixels change with the
camera, cached previews are reused on pan/zoom, node/group geometry and selection
refresh them, position changes work, and empty graphs render safely.

Validation: 210 library tests, production library build, demo TypeScript check,
library lint, nine Chromium e2e tests, and all eight final performance replays passed.
