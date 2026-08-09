# Expose a stable public flow facade

Status: needs-triage
Tier: critical-parity
Depends on: 02, 04

## Problem

Consumers can read a few values and call a few methods on `VflowComponent`, but advanced extensions often need `ɵ` services or duplicate internal queries. There is no single stable contract for querying the live rendered flow from a component reference or descendant Angular component.

## Required behavior

- Define one small supported interface for live graph, viewport, connection, bounds, intersection, and coordinate queries.
- Make the facade available from the root component and through Angular dependency injection for descendants.
- Include all nodes/edges, lookup by id, handle/node connections, detached edges, measured bounds, intersections, viewport state, and coordinate transforms.
- Separate pure queries from DOM-measured or rendered-instance queries in naming and documentation.
- Keep structural mutations outside the facade; those use requests and pure change helpers.
- Hide coordination across relevant `ɵ` services behind the facade rather than mirroring each internal service method.
- Use the same interface as the public test surface; do not expose extra internal seams solely for tests.

## Acceptance

- Every documented facade method has stable public types and defined behavior before and after initialization.
- Custom Angular nodes can query graph relationships without importing an internal service.
- Queries respect hidden entities and nested groups consistently with issues 01 and 02.
- The facade does not expose internal writable collections or create a second graph store.
- Existing root methods are retained, delegated, or migrated with a documented compatibility path.
- Public API tests verify both component-reference and DI access.

## Out of scope

- An imperative CRUD store.
- History, persistence, or serialization.
- Generic store selectors or devtools.

## Comments
