# DOM-first handles — real Angular follow-up

**Historical initial integration report. The completed DOM-first + scroll/collapse follow-up has now been promoted to the `new-design-system-pi` working tree at the user's request. See [current implementation and verification](angular-scroll-collapse.md). Results and unresolved items below describe the original isolated snapshot, not the current state.**

Source: local branch **`prototype/dom-first-handles`**, integration commit **`162e2db7`**,
worktree `../ngx-vflow-dom-first-prototype`. Baseline `d5a5c4ca` snapshots the original checkout's
existing changes and the standalone experiment; compare subsequent commits for the integration.
The original working tree's core/demo/test changes were not modified by this follow-up.

## Open

The prototype server runs at:

- http://localhost:4300/design-system/pipeline
- http://localhost:4300/design-system/entities

Restart from the original checkout with:

```bash
cd ../ngx-vflow-dom-first-prototype
npm run start:prototype:dom-first
```

Try **Inset rows (24px)**, zoom, rename/reorder, compact rows and connection recreation.
No permanent dual-placement API was introduced. Scroll/collapse remains explicitly unresolved.

## What this established

- Real custom handles use CSS placement and measured DOM boxes; no measured custom-port
  insets or inverse containing-block compensation. Built-in default presentations are unchanged.
- Pipeline needs no layout migration. ERD needs one shared UI rule: position field rows relatively.
- Actual SVG endpoints agree with ports at zoom 0.5/1/1.5, both with and without row insets.
  First 24 sampled visible-edge frames per scene had error below 0.0001 screen px.
- ERD rename/reorder and real magnetic-area connection recreation passed the existing test.
  Native pipeline controls left graph node positions unchanged. Camera/color added no custom-handle
  BCR calls in the sampled interval; this is not a performance budget.

## Kept visible, not papered over

- Core/UI builds and core lint pass.
- Existing relevant docs checks: **3 passed, 1 failed**. The failed pipeline check sees the page
  scroll 450 px on slider focus; graph viewport transform and node model points remain unchanged.
  Added prototype UI makes that screen-space equality assertion unsuitable without scrolling first;
  it was not edited to hide the failure.
- Existing core tests: **219 passed, 7 failed**. Five expect old inline positioning styles.
  Two constrained-resizable tests expose an extra-frame synchronization difference: surface 350 px,
  wrapper/handle still 420 at the existing checkpoint, then 350 one frame later. That needs a real
  lifecycle decision/fix, not merely relaxing tests or restoring incidental CSS writes.
- Scroll moves DOM ports but leaves stale endpoints (about 24.385 screen px for 24 flow px scrolling
  in the sampled ERD view). Hidden boxes cannot demonstrate endpoint accuracy; expand restores it.

Before adoption: resolve resizable synchronization; migrate tests to DOM/SVG/first-frame assertions;
review remaining consumers, update ADR-0001, and repeat production/distribution/consumer acceptance.

## Captured primary sources

On `prototype/dom-first-handles`, under `.scratch/flow-design-system/`:

- `angular-dom-first-prototype.md` — detailed changes, commands, findings and limits.
- `inspect-dom-first.prototype.cjs` — repeatable diagnostic (`npm run inspect:prototype:dom-first`).
- `angular-dom-first-observations.json` — raw captured geometry observations.
- `handles-dom-first.prototype.html` — archived standalone experiment.

No production/main-branch commit, version bump or release was made.
