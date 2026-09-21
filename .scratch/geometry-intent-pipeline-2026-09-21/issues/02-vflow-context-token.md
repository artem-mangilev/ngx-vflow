# Introduce the `VflowContext` token

Status: resolved
Tier: 3.0-additive
Depends on: 01

## Problem

A transform or policy needs to read live geometry and to write through the engine, and today the only way is the
`ɵ` service block. The platform-parity effort plans a public facade (its issue 05) but it is still untriaged, and the
pipeline cannot wait for the full read surface.

## Required behavior

- `VflowContext` is an abstract class used as a DI token, provided by `<vflow>` and injectable by features and by any
  descendant of `<vflow>`. It is the object parity issue 05 will grow; that issue must extend this class, not add a
  second one.
- This issue adds:
  - `getNodeGeometry(id: string): NodeGeometry | null` with `point`, `globalPoint`, `width`, `height`, `parentId`,
    `measured`, read from live models.
  - `gesture: Signal<GestureSession | null>`.
  - `revision: Signal<number>` (incremented by issue 06).
  - `propose(kind: 'move' | 'resize', changes: GeometryChange[], options?: { origin?: WriteOrigin }): boolean`,
    delegating to the pipeline of issues 03 and 04 with `source: 'plugin'`; `origin` defaults to the id of the calling
    feature when the call happens inside a feature's injection context, otherwise to `'application'`.
  - `interaction: Signal<'node-drag' | 'connection' | 'reconnection' | null>` and `pointer: Signal<Point | null>`
    (viewport pixels while a library gesture is active; core owns the single document listener).
  - `viewport: Signal<ViewportState>`, `size: Signal<{ width: number; height: number }>`, `panBy(delta: Point)`.
  - `clientToFlowPosition`, `flowToClientPosition`, `nodeSpaceToFlowPosition`, `flowToNodeSpacePosition` bound to this
    flow, delegating to the existing utilities.
- No writable collections, no `NodeModel` instances leak through the class.

## Acceptance

- A custom node component injects `VflowContext` and reads its own geometry without any `ɵ` import.
- A feature class injects `VflowContext` in its constructor and calls `propose()` from a `DestroyRef`-scoped
  subscription; the write appears as a `NodePositionChange` with the feature's origin.
- Public API test verifies DI access from a descendant and that the class exposes no model instance.

## Out of scope

- Topology, intersection, handle and viewport queries (parity issue 05).

## Comments

- 2026-09-21: Implemented. `features/vflow-context.ts` declares the abstract class with every member of this issue
  plus the types `RenderedNodeGeometry` (extends the existing flow-space `NodeGeometry` with `point` in parent
  space, `parentId`, `measured`), `FlowInteraction` and `ProposeOptions`. `services/flow-context.service.ts` is the
  implementation, provided on `<vflow>` as `{ provide: VflowContext, useExisting: FlowContextService }`; the pane
  directive attaches its element so client/flow conversion and the pointer use the same origin as the rest of the
  library. The document pointer listener exists only while `interaction()` is non-null.
- Deviations: `propose()` applies the batch as given (unknown ids and non-finite values are dropped with a dev-mode
  `console.error`) and bumps `revision` per applied batch; issue 03 routes it through the transforms. `origin`
  defaults to `'application'` and a feature passes its kind explicitly: entry providers are flattened, so the flow
  cannot tell which feature created an entry without per-feature injectors, which is not worth it. `pointer` is
  `null` until the first pointer event after a gesture starts. A written size marks the node explicit, as decision
  13 requires.
- Verified: 301 library tests green (7 new in `features/vflow-context.spec.ts`: node presentation and feature entry
  injection, geometry, proposal and revision, dropped proposals, explicit sizing, interaction and pointer, viewport
  and `panBy`, coordinate conversions), ESLint and Prettier clean, `nx build ngx-vflow` succeeds.
