# Publish structural graph operation helpers

Status: resolved
Tier: critical-parity
Depends on: —

## Problem

The application owns structural graph state, but consumers do not have supported helpers for planning and applying common structural operations. The current signal model also means that interactive change notifications cannot be treated blindly as reducer actions: position, selection, and size may already have been written to application-provided signals by core.

## Required behavior

- Keep every existing `NodeChange` and `EdgeChange` variant as a post-mutation notification. Structural graph operations use separate helper inputs and never replay interactive signal changes.
- Publish `addNodes`, `removeNodes`, `reparentNodes`, `addEdges`, `removeEdges`, and `reconnectEdges` from one `utils/graph-operations` module. Helpers accept readonly collection inputs, apply each input left-to-right, and never maintain a store. `reparentNodes` updates the supplied node's writable `point` and `parentId` signals so its runtime identity remains stable.
- Accept only the collections each helper needs. Multi-collection helpers receive an object context; operations target current entities by id.
- Append additions, retain survivor order, and replace reconnected entities in their existing slots. Reparent nodes in place through their existing signals and return a new node array after any successful operation. Preserve every unaffected entity and signal reference; return original collection references for a full no-op.
- Require caller-supplied non-empty ids. Duplicate or ambiguous ids, missing requested parents or endpoints, invalid ancestry, and missing reconnect targets are development-warning no-ops. Missing removal targets are quiet no-ops; no structural helper throws.
- Apply additions strictly left-to-right without forward references. Any node type may be a parent node. Missing pre-existing ancestors terminate ancestry at the root; cycles are guarded.
- Preserve a reparented node's flow-space position by updating its existing `point` and `parentId` signals without replacing the node object. If an optional `parentId` signal is absent, create it on the same object. Moving a parent carries descendants without rewriting them.
- Make node removal always cascade through descendants and incident edges. Return next and removed collections in original collection order; safely remove a reachable parent cycle with a development warning.
- Accept ready `Edge` values in `addEdges`. Allow self-connections, preserve opaque custom handle ids, reject missing endpoints, and silently ignore duplicate source/source-handle/target/target-handle tuples. Treat absent and empty handle ids as equal.
- Preserve an edge id during reconnection, retain all non-connection fields and signals, and do not apply duplicate-connection validation to reconnections.
- Keep application-specific validation, persistence, undo/redo, and policy customization outside the helpers.

## Acceptance

- Export all six helpers plus `NodeReparentOperation`, `EdgeReconnectOperation`, and `RemoveNodesResult` from the supported package entrypoint.
- Focused public-interface tests cover ordering, left-to-right conflicts, identity preservation, no-ops, cascades, cycles, arbitrary parent types, coordinate preservation, duplicate ids and connections, self-connections, custom handles, and missing entities.
- Add one `Utilities / Graph operations` page. Update change handling, subflows, connection, reconnection, and deletion documentation/examples to use the resolved terminology and helpers.
- Verify library tests, lint, formatting, the library build, and the demo/docs build.

## Out of scope

- Undo/redo history.
- A generic reducer for already-committed interactive signal updates.
- Transactions across arbitrary application state.
- Automatic id generation.
- Connection-policy options or custom handle existence validation.

## Comments

- Grilling round 1: keep every existing `NodeChange` and `EdgeChange` variant as a post-mutation change notification. Introduce separate pre-application structural graph operation types; do not provide a reducer for interactive notifications.
- Apply batched structural graph operations left-to-right. Each operation observes prior results, and a later removal targeting an already-missing entity is a no-op.
- Reparenting preserves flow-space visual position by default. Reject self-parenting, descendant-parenting, and cyclic ancestry without throwing.
- Removing a node cascades to its descendants and all incident edges by default. The application decides whether and how to apply the result; no separate deletion lifecycle is needed.
- Structural edge operations allow self-connections and parallel edges but reject missing endpoints without throwing. Duplicate connection identity compares source node, normalized source handle, target node, and normalized target handle; `undefined` and `''` handles are equivalent.
- Invalid operations are deterministic no-ops and never throw. In development mode, duplicate entity ids, missing parents or endpoints, invalid ancestry, and reconnecting a missing edge emit `console.warn` with the existing `[ngx-vflow]` prefix. Repeated removal of an already-missing entity is an intentional quiet no-op.
- Publish six plural-only operation-specific helpers rather than one graph-level reducer: `addNodes`, `removeNodes`, `reparentNodes`, `addEdges`, `removeEdges`, and `reconnectEdges`. A one-item operation uses a one-item collection; do not add singular aliases or overloads.
- Each operation-specific helper accepts only the collections required for its behavior. Simple node-only or edge-only operations return that next collection; operations that require graph context accept the necessary node and edge collections without forcing every helper through a uniform graph wrapper.
- Operations within one helper call apply left-to-right. Operations across different helpers follow ordinary JavaScript call order; there is no general `GraphOperation` union or cross-kind batch executor.
- `removeNodes` always removes descendants and incident edges. Do not expose cascade switches; callers that retain descendants reparent them before removal.
- Added nodes and edges carry caller-supplied ids. Duplicate ids are development-warning no-ops. Reconnection preserves the existing edge id; changing an id is an explicit `removeEdges` then `addEdges` composition. Structural helpers do not generate ids.
- Do not add connection-policy options in the first release. Keep application-specific validation outside these helpers and leave room to add an optional final options parameter later if a concrete need emerges; do not publish an empty options type now.
- Align `addEdges` with React Flow's duplicate policy: ignore a new edge when an existing edge has the same source node, normalized source handle, target node, and normalized target handle, even when entity ids differ. Emit no warning for this expected duplicate no-op. This avoids redundant edge rendering; `reconnectEdges` still replaces the addressed edge rather than performing duplicate validation.
- Removal, reparenting, and reconnection target current entities by id rather than object reference.
- Additions append in input order. Survivors retain their order, object references, and signal references. Reparenting updates the addressed node's existing `point` and `parentId` signals, creating only a missing optional `parentId` signal, preserves its object identity, and returns a new array after any successful operation; reconnection replaces the addressed edge in its existing slot and changes only the connection fields. A fully no-op helper call returns the original collection references.
- `addEdges` accepts ready `Edge` values with caller-supplied ids, not bare `Connection` values. `reconnectEdges` accepts `{ id, connection }` operations because it preserves the addressed edge id and metadata.
- `removeNodes` returns next `nodes` and `edges` plus the exact `removedNodes` and `removedEdges` references so applications can inspect and apply the cascade without repeating traversal.
- Any node type may be a parent node. `reparentNodes` validates target existence and ancestry but does not require a visual group type; update the Subflows documentation so it does not describe group node types as the only valid parents.
- During reparenting, an already-missing ancestor terminates that coordinate chain as a root, matching renderer and bounds-query tolerance. A missing directly requested target remains a development-warning no-op, and a cycle remains a development-warning no-op.
- Multi-collection helpers receive an object context: `removeNodes(ids, { nodes, edges })`, `addEdges(additions, { nodes, edges })`, and `reconnectEdges(operations, { nodes, edges })`.
- `removeNodes` returns removed nodes in original node-collection order and removed edges in original edge-collection order, independent of requested-id order or descendant depth.
- Export `NodeReparentOperation`, `EdgeReconnectOperation`, and generic `RemoveNodesResult` types as the minimal named structural-operation interface.
- ADR-0003 records that any node type may act as a parent node.
- Put the complete structural-operation module in `utils/graph-operations.ts`, separate from topology and bounds queries in `utils/graph.ts`. Export and test the six helpers and their three public types through this single seam; do not create one module per helper.
- Add one `Graph operations` page under `Utilities`. Update `Handling changes` to classify existing changes as notifications, `Subflows` to allow any parent node type, and the connection, reconnection, and deletion examples to use the relevant helpers.
- When a targeted id is duplicated in a current collection, that operation is ambiguous and becomes a development-warning no-op; do not choose one occurrence or remove every occurrence. Other operations in the same helper call continue.
- Additions apply strictly left-to-right. A node whose requested parent is not yet present, or an edge whose endpoints are not yet present in the supplied context, is a development-warning no-op even if the missing entities occur later in the same additions input.
- `removeEdges` returns only the next edge collection. Unlike node removal, it has no hidden cascade requiring removed-entity metadata.
- If a removed node participates in an existing parent cycle, `removeNodes` emits a development warning and safely removes the full reachable descendant closure plus incident edges. Reparenting through cyclic ancestry remains a development-warning no-op; unrelated cycles do not affect the operation.
- Implemented the six public helpers and three public operation/result types in `utils/graph-operations.ts`, with public-entrypoint tests and updated demos, reference documentation, domain terminology, and ADR-0003.
- Verification after the identity-preserving reparent update: Prettier passed; all 108 library tests and the focused drag-and-drop demo regression passed; library and demo lint passed; library and demo/docs builds passed.
