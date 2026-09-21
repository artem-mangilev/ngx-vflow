# Make auto-pan an opt-in feature, `withAutoPan()`

Status: needs-triage
Tier: 3.0-breaking
Depends on: 02, 03

## Problem

Auto-pan is an internal directive switched by the `autoPan` input (`directives/auto-pan.directive.ts`), and node
following during a pan is a second write path inside `DraggableService` (`moveNodesOnAutoPan$`). It is a behavior
over the public gesture and viewport state and nothing else, so it should not exist in core at all: it is the first
feature that leaves core entirely and proves that `VflowContext` is enough to write one.

## Required behavior

- `withAutoPan(options?: AutoPanSettings)` returns a `VflowFeature<'auto-pan'>`. The options object
  and defaults are those of parity issue 08 (`nodeDrag`, `connectionDrag`, `speed`, `margin`).
- The feature is a service created by the `<vflow>` injector that reads `VflowContext.interaction`, `pointer`, `size`
  and calls `panBy` on animation frames, with the existing edge-factor easing and per-second speed. It moves no nodes:
  the pointer session of issue 03 follows the viewport, and the connection preview already follows the pointer.
- The feature lives outside the core folder (`libs/ngx-vflow/src/lib/features/auto-pan/`) and imports only public
  API, so it is also the reference for third-party features.
- `AutoPanDirective`, the `autoPan` input and `FlowSettingsService.autoPan` are removed. A `<vflow>` without
  `provideVflow(withAutoPan())` does not pan during node or connection drags. `autoPanOnNodeFocus` stays an input (a
  focus behavior, not a gesture behavior) until the accessibility feature spec decides otherwise.
- Migration entry: auto-pan is no longer on by default; `[autoPan]="x"` → `provideVflow(withAutoPan(x))`, and a
  flow that relied on the default adds `provideVflow(withAutoPan())`. The docs demos that need it add it.

## Acceptance

- Existing auto-pan specs and the docs e2e pass through the feature, including node following during a pan and
  connection-drag panning. A `<vflow>` without the feature does not pan and creates no auto-pan service.
- The feature's source imports nothing from `lib/vflow` internals.
- No `autoPan` input in the built `index.d.ts`.

## Out of scope

- Auto-pan on keyboard focus; changes to speed or easing.
