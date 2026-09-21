# Geometry intent pipeline and `provideVflow()`

The first slice of the plugin architecture from
[plugin-architecture-2026-09-20/reports/Архитектура плагинов ngx vflow.md](../plugin-architecture-2026-09-20/reports/Архитектура%20плагинов%20ngx%20vflow.md):
the seam between "the library computed a change" and "the library wrote it into the application's signals", and the
Angular-idiomatic way to register code on that seam. Everything else in the report (ephemeral layer, spatial index,
strategy slots, command registry, bbox provider) builds on this slice and gets its own spec.

## Goal

Every library-originated change of node geometry and every connection attempt passes through one synchronous
pipeline before it reaches application-owned state, so that:

- a feature can **transform** a proposed change (snap, constrain, grow the parent, compensate siblings) and **veto**
  it, without forking `DraggableService` or reaching into `ɵ` services;
- the existing sources of movement (pointer drag, keyboard) and the resizer feed the same pipeline, and a pointer
  drag follows the viewport by itself, so one feature covers all of them and auto-pan can be a feature that only pans;
- features are registered the way Angular registers optional capabilities, `provideVflow(withX(), withY())` in the
  `providers` of the host component, and their order is resolved once;
- every write the library makes carries an **origin** and a **gesture id**, so a feature can ignore its own writes and
  the application can group one gesture into one undo step;
- a **revision** counter lets asynchronous producers (layout, routing) discard results computed against a stale graph.

The pipeline covers changes the library initiates. Writes the application makes to its own signals bypass it by
design ([ADR-0002](../../docs/adr/0002-application-owned-graph-state.md)); this asymmetry is documented, not hidden.

## Current state (3.0 branch, 2026-09-21)

- The drag loop computes the candidate point and writes it in the same closure: `alignToGrid` then `moveNode`
  (`services/draggable.service.ts:246-258`). `moveNode` (`:316-329`) clamps to the parent when `extent === 'parent'`
  and calls `model.setPoint`. Auto-pan (`:373-395`) and keyboard `moveSelected` (`:54-68`) call the same two private
  methods per node. Multi-drag is a `forEach` over `dragNodes`, a closure variable; `FlowStatusService` carries only
  the initiator (`services/flow-status.service.ts:81-99`).
- The resizer writes position, size and child positions directly from `onChange` and turns the node explicit through
  `resizedExplicitly` (`public-components/resizable/node-resize-control.component.ts:95-123`). This is the only
  existing "parent size ↔ child positions" batch and it is closed inside the resizer.
- Measurement writes `offsetWidth/offsetHeight` straight into the model (`directives/node-resize-controller.directive.ts:27-38`).
- Connection validity is a fixed `every` over two built-in validators and one application validator
  (`models/connection.model.ts:13-23`); `canStart`/`canAccept` are checked separately by the controller
  (`directives/connection-controller.directive.ts:131-160,234-260`).
- Change notifications (`NodePositionChange`, `NodeSizeChange`) carry an id and a value, no author and no gesture
  (`types/node-change.type.ts`), and are delayed by `observeOn(asyncScheduler, 25)` (`services/node-changes.service.ts:84`),
  which makes "feature writes → notification → feature reacts" a real loop today.
- No `provideX()` function exists; the two DI tokens (`NODE_REF`, `EDGE_REF`) are entity context. All flow services
  are provided on `<vflow>` (`components/vflow/vflow.component.ts:118-140`), none in root.
- `AlignmentHelperComponent` is an in-tree "snap on drop" written against `node-drag-end` and `setPoint`
  (`components/alignment-helper/alignment-helper.component.ts:150-173`), enabled by the `alignmentHelper` input.

## Decisions

### Registration

1. `provideVflow(...features: VflowFeature[]): Provider[]` is placed in the `providers` of the component that hosts
   `<vflow>`. It returns `Provider[]`, not `EnvironmentProviders`, because every flow service is component-scoped.
   The nearest `provideVflow` up the injector tree wins; multi-providers from two levels are **not** merged (Angular
   does not define that merge; HttpClient had to add a second token to get it). A root-level "application defaults"
   variant is out of scope.
2. A feature is an instance of the class `VflowFeature<K extends string = string>` with readonly `kind: K` and
   `providers` and a private brand field, so a hand-written object literal does not type-check and `provideVflow` can
   verify `instanceof` in dev mode. Angular's `ɵkind`/`ɵproviders` spelling is not used: in this repository `ɵ` marks
   internals that are exported only for tests, and a feature record is public API. There is no enum of kinds: a closed
   enum cannot name a third-party feature, and the only job of `kind` is uniqueness, at most one feature of a kind per
   flow, checked in dev mode. Library features use documented literals (`'snap-grid'`, `'auto-pan'`, `'alignment-helper'`); third parties choose their own, namespaced by convention (`'acme:proximity-connect'`).
   `vflowFeature(kind, providers)` is the public constructor. `provideVflow` flattens providers and, in dev mode,
   reports duplicate kinds and duplicate entry ids.
3. Each seam is its own multi-provider token with its own small contract, not one `VflowPlugin` interface:
   `VFLOW_GEOMETRY_TRANSFORMS` and `VFLOW_CONNECTION_POLICIES` in this spec, more tokens in later specs. A feature
   registers an entry with a multi-provider on the token inside its `vflowFeature(kind, providers)` list, so a feature
   may contribute to several tokens and a flow may carry many entries of one seam under distinct feature kinds. The public `provideGeometryTransform(entry)` / `provideConnectionPolicy(entry)` helpers build that provider; they
   return `Provider[]`, and `withX()` is reserved for functions that return a `VflowFeature`.
4. Every entry has a string `id` and an optional `precedence: 'highest' | 'high' | 'default' | 'low' | 'lowest'`
   (default `'default'`). Order is resolved **once** per `<vflow>` at creation: precedence category first, then position
   in the flattened provider array. Duplicate ids are a dev-mode error. Precedence is declared by the feature author in
   its `withX()` factory; the user's array order is only the tie-break.
5. Entries may be values or classes (`Type<GeometryTransform>`), instantiated in the `<vflow>` injector so they can
   `inject()` services. Function-style entries run inside `runInInjectionContext` of the same injector.
6. The context a feature receives is the abstract class `VflowContext`, a DI token available to features and to
   descendants of `<vflow>`. It is the seed of the public facade planned in
   [core-platform-parity issue 05](../core-platform-parity/issues/05-expose-public-flow-facade.md): one object,
   grown by that issue. This spec adds to it only what the pipeline needs (see decision 16).

### Intents

7. A **geometry intent** describes a proposed batch of node geometry changes:

   ```ts
   interface GeometryIntent {
     readonly kind: 'move' | 'resize';
     readonly phase: 'start' | 'update' | 'end';
     readonly session: GestureSession;
     readonly origin: WriteOrigin; // 'core' or a feature id
     readonly changes: GeometryChange[]; // mutable: edit, push, splice
   }
   interface GeometryChange {
     readonly id: string; // node id
     point?: Point; // node space of the node's parent, like `Node.point`
     width?: number;
     height?: number;
     claimed?: Partial<Record<'x' | 'y' | 'width' | 'height', string>>; // id of the transform that fixed the axis
   }
   interface GestureSession {
     readonly id: string;
     readonly source: 'pointer' | 'keyboard' | 'resizer' | 'plugin';
     readonly initiator: string; // node id
     readonly nodes: readonly string[]; // every node the gesture moves or resizes
     readonly initial: ReadonlyMap<string, Rect>; // point (parent space) and size when the gesture started
     readonly pointer: Signal<Point | null>; // flow-space pointer for pointer sources, else null
   }
   ```

   A transform is `{ id, precedence?, kinds?, phases?, transform(intent, ctx): void | false }`. It mutates
   `intent.changes` in place (the diagram-js model: one allocation per frame, transforms cooperate on one object) and
   returns `false` to veto. `kinds` and `phases` filter which intents an entry sees, so a drop-only transform costs
   nothing per pointer move.

8. The batch is the unit, not the point. A transform may append changes for nodes that are not in the session (grow
   the parent, shift siblings), and the engine applies the whole batch atomically in one synchronous pass. This is what
   parent auto-grow needs and what a `Point => Point` hook cannot express.
9. Claim protocol: a transform that decides an axis writes its id into `claimed`; later transforms skip claimed axes
   unless they implement a hard constraint. `withSnapGrid()` respects claims; `core:node-extent` does not.
10. Phases and veto semantics:
    - `start` runs once when a gesture activates, with `changes` equal to the current geometry. `false` cancels the
      gesture: no activation, no drag status, no writes.
    - `update` runs per frame. `false` drops the frame; state is unchanged.
    - `end` runs once with the final geometry, after the last `update`. Transforms may still edit (snap on drop).
      `false` reverts every node of the session to `session.initial`. The `node-drag-end` status is set after the
      `end` batch is applied.
    - Keyboard moves and feature proposals are one-shot sessions: `start`, `update`, `end` run in the same tick.
    - A pointer session re-evaluates its candidate positions whenever the viewport changes while the pointer is still
      (the flow-space pointer is derived from the client point and the viewport), emitting an `update` in the same
      session. This is what lets auto-pan be a feature that only pans: `moveNodesOnAutoPan$` disappears.
11. Sources feeding the pipeline: the pointer drag loop (`source: 'pointer'`), keyboard arrows (`source: 'keyboard'`), the resizer
    gesture (`kind: 'resize'`, `source: 'resizer'`, changes = the resized node plus its children's positions), and
    `ctx.propose()` from features (`source: 'plugin'`). `DraggableService.moveNode` and `alignToGrid` disappear. Of the
    two behaviors they carried, one becomes an opt-in feature and one stays in core, by this rule: **a behavior that
    implements the semantics of an entity field or of an existing input is a core entry; a flow-level behavior that is
    off by default is a feature.**
    - `withSnapGrid(grid)` (`default`, `kinds: ['move', 'resize']`) is a feature. It replaces the `snapGrid` input,
      the resizer's own snapping and the grid-sized keyboard step. The keyboard step becomes a constant (5 px, ×4 with
      Shift) and the feature rounds a keyboard move away from `session.initial`, so one press lands on the next grid
      line.
    - `core:node-extent` (`lowest`, `kinds: ['move']`) is a core entry registered by `<vflow>`. It implements the
      per-node `Node.extent`, whose `'parent'` default and `null` opt-out stay as they are (Foblex Flow makes the same
      choice: bounds restriction follows from `fNodeParentId`, configured per node, no `withX()`,
      [f-node docs](https://flow.foblex.com/docs/f-node-directive)). It reads the parent's pending size from the same
      batch when present, so a grown parent widens the allowed area in the same frame, and ignores claims.
      Core entries carry the reserved `core:` prefix so a feature can order itself around them; today they are
      `core:node-extent` and the policies the `connection` input registers. Without any feature a drag writes the
      candidate point as computed, clamped by `core:node-extent` where the node asks for it.
12. Measurement is **not** an intent. The ResizeObserver path stays observational and keeps writing `auto` sizes.
    Transforming a measured size is a non-goal; a feature that wants a different size writes an explicit one.
13. Applying a change with `width` or `height` makes the node explicitly sized, exactly as the resizer does today,
    whatever the origin. That is the sanctioned way for a feature to own a parent's size; writing `resizedExplicitly`
    or `width`/`height` on the model directly stays internal.
14. The drag-start filter (`draggable.service.ts:176-205`, pointer-level rules on the DOM event) stays as it is. The
    `start` phase vetoes activation, not pointer routing.

### Connection policies

15. `ConnectionModel.validator` becomes a resolved chain of **three-valued policies**:
    `{ id, precedence?, decide(connection: ConnectionCandidate, ctx): boolean | null }`. `true` allows, `false`
    denies, `null` passes to the next entry; the chain result defaults to `true` when every policy passes. Core registers
    no policy of its own; the `connection` input registers what it configures: `core:not-self` at `lowest` unless
    `allowSelfConnections`, and `core:application` at `default` wrapping `ConnectionSettings.validator` (`false` when
    the function returns `false`, else `null`). The typed-handles rule (`notSameTypedHandlesValidator`) is not a policy
    but an invariant of the handle model, checked with `canStart`/`canAccept` before the chain. A feature registers its
    policy on `VFLOW_CONNECTION_POLICIES`. Moving `ConnectionSettings` itself to a `withConnection()` feature is left to the
    strategy-slot spec, which also owns the curve. `canStart`/`canAccept` remain entity eligibility gates evaluated before the chain, per the capability
    policy language in `CONTEXT.md`. The chain runs for creation and reconnection; `ConnectionCandidate` carries the
    edge being reconnected when there is one.

### Metadata, revision and context

16. `VflowContext` gains, in this spec:
    - `propose(kind, changes, options?: { origin?: WriteOrigin }): boolean` — runs a one-shot session through the
      pipeline and applies it; returns whether it was applied. This is how a layout or auto-grow feature writes.
    - `gesture: Signal<GestureSession | null>` — the active session (observe).
    - `revision: Signal<number>` — increments after every applied batch and whenever the `nodes` or `edges` input
      changes identity. Asynchronous producers capture it before starting work and compare before proposing.
    - `getNodeGeometry(id): NodeGeometry | null` — `point` (parent space), `globalPoint`, `width`, `height`,
      `parentId`, `measured`, read from the live models, not from raw nodes.
    - `interaction: Signal<'node-drag' | 'connection' | 'reconnection' | null>` and `pointer: Signal<Point | null>`
      in viewport pixels while a library gesture is active (core tracks the document pointer once; features add no
      listeners).
    - `viewport: Signal<ViewportState>`, `size: Signal<{ width: number; height: number }>` and
      `panBy(delta: Point): void`, delegating to the viewport service.
      Read queries beyond this belong to parity issue 05.
17. Every library write is tagged. `NodePositionChange` and `NodeSizeChange` gain
    `meta: { origin: WriteOrigin; gestureId: string }`. `ConnectStartEvent`, `ConnectEndEvent`, `ReconnectStartEvent`
    and `ReconnectEndEvent` gain `gestureId`; the `connect`/`reconnect` request emitted between them belongs to that
    gesture. A feature ignores notifications whose `meta.origin` is its own id (the origin-tag rule every libavoid and
    scopes integration invented independently); the application groups undo by `gestureId`.
18. Everything in the pipeline is synchronous. A transform must not schedule work on the intent; asynchronous features
    do their work outside and come back through `propose()` with a revision check.
19. Dev-mode checks, all behind `ngDevMode`: duplicate ids, unknown node ids in a batch, non-finite numbers, a
    transform mutating `session`, `provideVflow` encountered twice in one injector, a feature that is not a
    `VflowFeature` instance.

## Built-in features and what leaves core

The pipeline is dogfooded by moving existing behavior onto it. Every feature is opt-in: a `<vflow>` without
`provideVflow` no longer snaps to a grid, pans automatically or shows guides. Core keeps only the entries that
implement entity fields and existing inputs.

| Today                                                                                 | Becomes                                                                                                                                                                                                                                                                           | Phase |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `snapGrid` input, `alignToGrid`, the resizer's snapping, the grid-sized keyboard step | `withSnapGrid(grid)`, an opt-in transform on `move` and `resize`; the input is removed                                                                                                                                                                                            | A     |
| `extent: 'parent'` clamp in `moveNode`                                                | `core:node-extent`, a core entry on the pipeline; `Node.extent` unchanged                                                                                                                                                                                                         | A     |
| `autoPan` input + `AutoPanDirective` + `moveNodesOnAutoPan$`                          | `withAutoPan(options?)`, an opt-in feature that only pans the viewport; the pointer session follows the viewport itself; the input is removed and a `<vflow>` without the feature does not pan (3.0 is breaking; the options object from parity issue 08 is kept as the argument) | B     |
| Keyboard `moveSelected`                                                               | one-shot keyboard sessions; commands unchanged                                                                                                                                                                                                                                    | A     |
| Resizer `onChange` writes                                                             | `resize` intents; the resizer keeps its own drag math and snapping                                                                                                                                                                                                                | A     |
| `notSelfValidator`, `ConnectionSettings.validator`                                    | `core:not-self` and `core:application` policies registered by the `connection` input; `notSameTypedHandlesValidator` becomes a handle-model invariant                                                                                                                             | A     |
| `alignmentHelper` input + `AlignmentHelperComponent` snapping                         | `withAlignmentHelper({ tolerance })`: a transform at `phase: 'end'`, precedence `high` (guides snap before grid, as in diagram-js); the guide lines keep rendering from the core overlay until the ephemeral-layer spec lands; the input is removed (3.0 is breaking)             | B     |

Candidates deliberately left for later specs, with the seam they need:

- `selectionMode` strategies (`services/selection.service.ts:30-35`) → a strategy-slot token.
- Keyboard commands (closed union of 15) → a command registry.
- Accessibility as an opt-in feature, `withAccessibility()`: the keyboard layer (`KeyboardEntityDirective`,
  `KeyboardNavigationDirective`, the command services), `AnnouncerService` with the live region, `AriaDescriber`
  instructions and the `ariaLabels` catalogue. This is the split Foblex Flow ships: ARIA semantics built in, the keyboard
  and screen-reader layer through `withA11y()` ([flow.foblex.com/docs/accessibility](https://flow.foblex.com/docs/accessibility)).
  Wrapper roles, focusability and computed states stay in core per
  [ADR-0004](../../docs/adr/0004-library-owned-accessibility-wrappers.md); the layer is opt-in like every other
  feature, so the documentation has to make `withAccessibility()` the first thing a reader sees. It needs the command
  registry and a host-attribute seam for the live region, hence its own spec.
- The vizdom layout recipe in the docs → `withLayout()` over `propose()` and `revision`.
- Proximity connect, parent auto-grow, obstacle routing → this pipeline plus the ephemeral layer and spatial index.

Not features and not becoming ones: minimap, resizer and node toolbar (already composed through templates),
virtualization (a displayed-set concern of the renderer), accessibility wrappers, measurement.

## Non-goals

- The ephemeral layer, the spatial index, strategy slots (curve, layout, selection), the command registry, the bbox
  provider for rotation. Each is a separate spec; this one must not grow a second seam.
- Merging `provideVflow` across injector levels or a root-level defaults variant.
- The accessibility and keyboard feature.
- Implicitly registered ("default") features. Every feature is opt-in; core does not register features on its own.
- Transforming measured (`auto`) sizes.
- Asynchronous transforms or policies.
- Vetoing at the pointer-event level (the d3 drag filter).
- Enriching the `Connection` request from a policy (diagram-js `canExecute` returning attributes); the application owns
  edge creation.
- A dependency graph between features (`before: 'x'`). Five precedence categories plus array order, as in CodeMirror.

## Dependency order

| Phase                     | Issues                                                                                                                                          | Release                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| A — registration and seam | 01 `provideVflow`; 02 `VflowContext`; 03 move intents; 04 resize intents; 05 connection policies; 06 metadata and revision; 09 `withSnapGrid()` | 3.0, breaking where noted, must land together |
| B — first-party features  | 07 `withAlignmentHelper()`; 08 `withAutoPan()`                                                                                                  | 3.0, breaking (inputs removed)                |
| C — documentation         | 10 docs, testing helpers and e2e                                                                                                                | with each phase, finalized after 09           |

## Issues

1. [Add `provideVflow()` and the feature record](issues/01-provide-vflow-feature-record.md)
2. [Introduce the `VflowContext` token](issues/02-vflow-context-token.md)
3. [Route every movement through move intents](issues/03-move-intents.md)
4. [Route the resizer through resize intents](issues/04-resize-intents.md)
5. [Resolve connection validity through a policy chain](issues/05-connection-policy-chain.md)
6. [Tag writes with origin and gesture id and expose the revision](issues/06-write-metadata-and-revision.md)
7. [Move the alignment helper onto the pipeline as `withAlignmentHelper()`](issues/07-with-alignment-helper.md)
8. [Make auto-pan an opt-in feature, `withAutoPan()`](issues/08-with-auto-pan.md)
9. [Make grid snapping an opt-in feature, `withSnapGrid()`](issues/09-with-snap-grid.md)
10. [Document the pipeline and add testing helpers](issues/10-document-pipeline.md)
