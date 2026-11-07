# Typing audit, 2026-11-07

Whole-library typing review of `libs/ngx-vflow` (branch 3.0). Strict `tsc` is clean; the weakness is systemic:
the data parameter `T` lives in `Node<T>` and `createNodes`, and is lost on every boundary a consumer meets.

## Decisions

- D1 `VflowComponent<N extends Node = Node, E extends Edge = Edge>`: `nodes`/`edges` inputs are `readonly N[]` /
  `readonly E[]`, strictTemplates infers `N`/`E` from the bindings. Drag, connection and typed change outputs move
  from the three thin host directives onto the component so `$event` carries `N`/`E`; the directives are deleted.
  `getNode()`, `getNodesAtPoint()`, `getIntersectingNodes()`, `getDetachedEdges()` return `N`/`E` and lose their
  return-only type parameters. In code, `viewChild.required<VflowComponent<MyNode>>(VflowComponent)`.
- D2 `*vNode="let ctx; of: nodes()"` / `*vEdge="let ctx; of: edges()"`: the template directives take an optional
  type witness input (`vNodeOf`, `vEdgeOf`) that is never read at runtime; the context guard then types `ctx`.
  Without it the context stays `NodeRef<any>` as before.
- D3 `componentNodeEvent`/`componentEdgeEvent` are `OutputRef<AnyComponentNodeEvent>` instead of `any`; events carry
  the component class, and `isComponentNodeEvent(event, Cmp)` / `isComponentEdgeEvent(event, Cmp)` narrow to
  `ComponentNodeEvent<[Cmp]>`. Protected outputs are forwarded at runtime but invisible to `keyof`, documented.
- D4 One encoding of "no handle id": `undefined`. `createEdge` no longer fills `''`; `sameConnection` treats `''`
  from the application as absent.
- D5 `ConnectEndEvent`/`ReconnectEndEvent`: `valid` and `to` are one discriminated outcome
  (`{ valid: null; to: null } | { valid: boolean; to: { node; handle } }`).
- D6 Collections the library only reads are `readonly` in inputs and option objects.
- D7 Kept: `NodeRef.data` falls back to `{}` for a node without `data` (runtime safety for templates), and
  `createNodes` unions drop data-less nodes; both documented instead of changed.
- D8 Left for later: `noUncheckedIndexedAccess` (55 spots, 27 in `smooth-step-path.ts`) and
  `exactOptionalPropertyTypes` (14 spots).

## Tickets

- 01 type lies: `NodeModel.point`, `extendedComputed`, outlet cast, `getIntersectingNodes` default
- 02 generic flow component and typed events (D1)
- 03 typed template contexts (D2)
- 04 component events without `any` (D3)
- 05 handle ids, connect-end outcome, readonly collections, nits (D4–D6)
- 06 internal hygiene: readonly fields, `ReadonlyMap`, `!`/`?.`, DOM casts, `FlowEntity` union, return types
- 07 docs and demos

## As built (2026-11-07)

- 01: `NodeModel.point` is the application signal (no throwaway signal, no dead check); `extendedComputed` callback
  takes `TValue | undefined`; the outlet calls the factory without a cast; `getIntersectingNodes` defaults to
  `partially: true` in the util, the interface doc and the method agree.
- 02: `VflowComponent<N, E>`; `nodes`/`edges` are `readonly N[]`/`readonly E[]`; `nodeDrag*`, `connect*`,
  `reconnect*` and the `nodesChanges.*` / `edgesChanges.*` outputs are declared on the component (the three
  controller directives are deleted, `ViewportCullingDirective` stays); `NodeDragEvent<N>`, `ConnectStartEvent<N>`,
  `ConnectEndEvent<N>`, `ReconnectStartEvent<N, E>`, `ReconnectEvent<E>`, `ReconnectEndEvent<N, E>`,
  `NodeAtPoint<N>`; `getNode(): N | undefined`, `getNodesAtPoint(): NodeAtPoint<N>[]`, `getIntersectingNodes(): N[]`,
  `getDetachedEdges(): E[]`; `bindVflowInputs` generic. Casts: `rawNode as N` / `edge as E` in the component only.
- 03: `VflowNodeTemplateDirective<T = any>` / `VflowEdgeTemplateDirective<T = any>` with `vNodeOf` / `vEdgeOf`
  witnesses and generic context guards; `NodeContext<T>`, `EdgeContext<T>`, named `ConnectionRef`; node and connection
  components take typed `TemplateRef`s.
- 04: events carry `component: Type<unknown>`; `isComponentNodeEvent` / `isComponentEdgeEvent` guards; outputs typed
  `AnyComponentNodeEvent` / `AnyComponentEdgeEvent`; `EventKeys` limited to string keys. Docs demos migrated.
- 05: `createEdge` leaves handle ids absent, `EdgeWithDefaults` keeps them optional, `sameConnection` treats `''` as
  absent; `ConnectionEventOutcome`; readonly inputs/options; `Marker.orient` union; `labelPoints` partial;
  `[vResizable]` is `booleanAttribute`; `ResizeParams = Rect`; `DEFAULT_*`, `NODE_DEFAULTS`, `EDGE_DEFAULTS`,
  `MARKER_DEFAULT_TYPE` exported; `export type` for type-only names.
- 06: readonly signal fields in the models, `ReadonlyMap` computeds and `hasEndpoints()` in `FlowEntitiesService`,
  `EdgeModel.source/target: NodeModel | null`, `addNodesToEdges` on a `Map`, `createPointerTracker` without `!`
  (`TrackedPress` passed through), `GestureElement = Element & GlobalEventHandlers`, `ConnectionService.start`
  takes a `PointerEvent`, `isNoSelectTarget` narrows with `instanceof`, `FlowEntity` widened and used instead of
  `NodeModel | EdgeModel`, `Partial<Record>` lookup tables, return types on public service and model methods.
  `forwardSignal` keeps its cast: the writable brand is private to Angular.
- 07: custom-nodes, custom-edges, unit-testing-component-nodes and migration pages; ADR-0010.
