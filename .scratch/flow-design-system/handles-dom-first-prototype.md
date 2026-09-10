# DOM-first handles — throwaway prototype

**Status: user approved the DOM-first placement direction. Standalone source archived on
`prototype/dom-first-handles` at `d5a5c4ca`. The completed Angular follow-up is now promoted to the
`new-design-system-pi` working tree with ADR-0008; see [current status](angular-scroll-collapse.md).
This document preserves the standalone prototype observations.**

Question: can CSS own handle placement while core only reads the actual handle rect,
without distributing row-to-node-boundary projection complexity across consumers?

## Run

Open the archived `handles-dom-first.prototype.html` directly in a browser.
On this macOS checkout (the prototype worktree is alongside the main checkout):

```bash
open ../ngx-vflow-dom-first-prototype/.scratch/flow-design-system/handles-dom-first.prototype.html
```

One file, inline CSS/scripts/image, no server, dependencies, network or persistence.
Archived beside the implementation issue and research on the prototype branch, outside
production sources. Recover without that worktree with
`git show prototype/dom-first-handles:.scratch/flow-design-system/handles-dom-first.prototype.html`. Source classes are private to the prototype, not a proposed public CSS API.

## Try

- **Край строки или край ноды?**: pipeline rows inset 36 px, card border 6 px,
  port size 22 px, then zoom 150%. Blue ports stay at the row boundary; orange ghost
  ports show the alternative node-boundary projection. Approximately 42 flow px difference
  is an intentional contract difference, not an alignment defect.
- **ID ≠ подпись и порядок**: rename and reorder `users:email`; the link keeps its ID.
  Deleting the field explicitly removes its incident link in the demo's application model.
- **Scroll требует решения**: scroll 45 px with refresh off, audit the stale endpoints,
  refresh, audit again. Then collapse: old endpoints remain intentionally, exposing the
  unresolved hidden-port policy. Optional scroll subscription fixes stale coordinates,
  not clipping, routing or hidden-port fallback.
- Free play: choose simple nodes for all four sides; change port size/borders/content,
  pan/zoom, switch palette, use the pipeline's native slider/export button.

The first script is pure rect normalization, endpoint selection, comparison projection and
Bezier construction. The second script is a disposable DOM adapter/UI. No computed position
is written back to an actual port's CSS insets. SVG ghost ports are comparison geometry only.
Endpoints attach to the selected face of the measured port box, not its center or hit target.

## Observations from Chromium smoke

Driven with Playwright against the local file; no test suite added:

- Simple (8 ports), pipeline (5), ERD (10), each at zoom 0.5 / 1 / 1.5:
  diagnostic discrepancy **0.000 screen px**, rounded to three decimals.
- Nested/bordered pipeline with enlarged ports at zoom 1.5: **0.000 screen px**.
- ERD rename/reorder preserved IDs and links; deleting `users:email` removed that endpoint
  and its link, leaving the ID link.
- Palette + pan + zoom did not increase the prototype's geometry-pass/BCR counters.
  Content growth refreshed geometry and restored agreement; native controls remained operable.
- Scroll 45 flow px at zoom 0.8 without subscription: **36.000 screen px** stale-cache error;
  manual refresh: **0.000**. Opt-in scroll subscription also restored agreement.
- Collapse retained five hidden endpoints' last geometry as explicitly advertised.
- No browser script errors in these runs.

The diagnostic rereads actual DOM boxes and compares them with cached SVG endpoint coordinates;
it does not repair the cache. Measurement counters count `getBoundingClientRect` calls, not
all layout/style reads. This is a geometry smoke, not a performance comparison.

## Limits and verdict

These are simplified HTML replicas, **not the real Angular compositions or a core integration**.
Layout actions explicitly schedule measurement; a ResizeObserver also watches node/port size.
The shell recreates node HTML for several actions and does not attempt production lifecycle or
DOM identity optimization. The orange projection illustrates the old responsibility, not a
byte-for-byte reproduction of current `HandleModel` geometry or its containing-block conversion.

Not established: Angular scheduling/readiness, first rendered edge frame, virtualization,
connection gestures/eligibility, accessible wrappers, hit-target separation, arbitrary CSS
transforms, production geometry/performance acceptance, or a scroll/collapse policy.

**Provisional observation:** DOM-first handles can represent these layouts without inverse
`offsetParent` calculations in the measuring layer. But placing a nested row's port on the
outer card boundary still requires an explicit layout decision; the prototype makes that
trade-off visible rather than resolving it.

The user accepted the blue row-boundary behavior as the target contract. The standalone source
is now archived on `prototype/dom-first-handles`, not kept as production/main-branch code.
[Real Angular follow-up](angular-dom-first.md) records the isolated integration and remaining gates.
Do not add a permanent dual-mode public API merely to preserve this comparison.
