# Publish graph topology and bounds utilities

Status: needs-triage
Tier: critical-parity
Depends on: —

## Problem

Common graph queries require consumers to reimplement adjacency traversal and bounds calculations. Similar helpers exist internally or in competitor public APIs, but ngx-vflow does not expose a coherent framework-neutral utility surface.

## Required behavior

- Add pure public helpers for connected edges, incoming nodes, outgoing nodes, and node bounds.
- Define behavior for missing endpoints, detached edges, self-connections, multiple handles, nested groups, and hidden entities.
- Accept public node/edge data rather than internal models or Angular services.
- Reuse one implementation from public helpers and internal consumers where semantics match.
- Use correct generic types without falling back to `any`.

## Acceptance

- Consumers can answer adjacency and bounds questions without rendering a flow or importing internals.
- Results are deterministic and do not mutate input arrays or signals.
- Focused unit tests cover detached edges, duplicate connections, groups, hidden entities, empty input, and missing ids.
- The utilities are exported from the supported package entrypoint and documented with examples.

## Out of scope

- General graph algorithms such as shortest path, cycle detection, or topological sorting.
- Layout algorithms.
- DOM-measured bounds for unmeasured custom nodes.

## Comments
