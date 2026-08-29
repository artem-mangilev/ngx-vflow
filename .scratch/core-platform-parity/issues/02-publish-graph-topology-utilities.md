# Publish graph topology and bounds utilities

Status: resolved
Tier: critical-parity
Depends on: —

## Problem

Common graph queries require consumers to reimplement adjacency traversal and bounds calculations. Similar helpers exist internally or in competitor public APIs, but ngx-vflow does not expose a coherent framework-neutral utility surface.

## Required behavior

- Add pure public `getConnectedEdges`, `getIncomers`, `getOutgoers`, and `getNodesBounds` helpers.
- Define behavior for missing endpoints, self-connections, duplicate connections, and nested groups.
- Treat topology as node-level relationships determined only by `source` and `target` ids. Handle existence and handle-level detachment require rendered state and remain live-facade concerns.
- Preserve edge order, occurrences, and references in `getConnectedEdges`. Return each adjacent node at most once from `getIncomers` and `getOutgoers`, in node input order; a self-connection makes the node both an incomer and an outgoer.
- Treat topology helpers as tolerant queries rather than graph validators. Missing query ids and missing adjacent nodes produce empty or omitted node results. Non-empty unique node ids are an input invariant and are not validated at runtime.
- Accept readonly public `Node`/`Edge` collections rather than internal models or Angular services. Framework-neutral means that the helpers require no Angular injection context, rendered flow, or DOM access; reading application-owned signals is allowed.
- Follow the React Flow bounds split without exposing internal models: `getNodesBounds(nodes)` reads the supplied node coordinates directly, while an optional public `ReadonlyMap<string, Node>` lookup supplies ancestry context for resolving nested nodes into flow coordinates. Lookup-only ancestors do not contribute their rectangles to the result.
- Treat a missing width or height as zero rather than applying renderer defaults. A missing parent terminates ancestry as a root; cyclic ancestry skips that node with a development warning. Empty or fully skipped input returns a zero rect.
- Include only nodes passed in the first argument in the bounds union. Descendants are never added implicitly.
- When a node lookup is supplied, treat it as the authoritative snapshot for coordinates and dimensions; the first argument selects ids only, and selected ids absent from the lookup are skipped.
- Assume finite positions and non-negative dimensions without runtime numeric validation. Keep node-origin support out of this issue; all nodes use the current top-left origin until issue 08 extends the contract consistently.
- Reuse one implementation from public helpers and internal consumers where semantics match.
- Use correct generic types without falling back to `any`.

## Acceptance

- Consumers can answer adjacency and bounds questions without rendering a flow or importing internals.
- Results are deterministic and do not mutate input arrays or signals.
- Focused unit tests cover missing endpoints, duplicate connections, self-connections, groups, empty input, and missing ids.
- The utilities and `Rect` are exported from the supported package entrypoint, carry focused TSDoc examples, and are documented together on a dedicated `Graph utilities` page in a top-level `Utilities` documentation category.

## Out of scope

- General graph algorithms such as shortest path, cycle detection, or topological sorting.
- Layout algorithms.
- DOM-measured bounds for unmeasured custom nodes.
- Presentation filtering or hidden-state semantics. Callers pass the entity collections they want the pure utilities to query.

## Comments

- Agreed during pre-implementation grilling: use the conventional React Flow utility names and argument order; keep `getNodesBounds` in this issue rather than duplicating flow-bounds work in issue 04.
- Pure topology is node-level. `getConnectedEdges` retains an edge incident to a requested node even when its opposite endpoint or a referenced handle is missing; handle-aware detachment remains part of the rendered flow facade.
- Topology results follow the conventional cardinality and ordering contract: edges retain input multiplicity and order, while adjacent nodes are unique and retain node input order. The helpers do not perform runtime id validation.
- Bounds for an arbitrary nested-node subset use an optional public node lookup, analogous to React Flow's lookup-backed subflow behavior. Without a lookup, node points are interpreted directly; the rendered facade planned in issue 05 will be able to supply lookup context automatically.
- Missing dimensions have zero extent. Lookup ancestry is tolerant of missing parents and guarded against cycles. Lookup-only parents and unrequested descendants never enlarge the result.
- A supplied lookup is authoritative for selected-node data. Numeric values are trusted, node origin is deferred to issue 08, and the four helpers will share a dedicated documentation page rather than being scattered across existing guides.
- Documentation adds the `Utilities` category with only the `Graph utilities` page in this issue; later utility issues may add their own pages without placeholder scaffolding here.
- Implemented in the public `utils/graph` module with focused Jasmine coverage and main-entrypoint exports for all four helpers and `Rect`. Added the dedicated NgDoc page and verified the library build, all 87 library tests, library lint, formatting, and the demo/docs build.
