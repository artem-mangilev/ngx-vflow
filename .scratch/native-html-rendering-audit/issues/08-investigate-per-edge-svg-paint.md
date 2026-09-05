# Investigate per-edge SVG paint cost

Status: ready-for-agent
Priority: P3
Type: research

## Question

Can the native HTML viewport reduce the paint cost of one SVG root per edge without losing arbitrary edge/node `z-index` interleaving?

## Baseline evidence

On `/performance/stress-test` with 1,023 edges, a settled 30-wheel burst produced:

- Edges visible: 30,357 paint slices and 126 ms total paint time.
- Edge layer hidden: 119 paint slices and 18 ms total paint time.
- Delta: approximately 108 ms per burst, or 3.6 ms per wheel event.
- TaskDuration fell by roughly 20% when edges were hidden.
- Neither mode exceeded a 16.7 ms frame gap on the measured machine.

This is not the source of the cold-start freeze, and the current architecture remains accepted for v3 unless an alternative preserves its stacking semantics.

## Constraints

- Nodes and edges with arbitrary render orders must interleave in the same effective stacking model.
- Marker definitions, custom edges, reconnect handles, selection, and pointer-event pass-through must continue to work.
- Do not replace the accepted architecture based only on SVG-root count; measure paint and interaction behavior.
- Do not add a permanent CI performance threshold as part of this ticket.

## Deliverable

- Measure at least one viable alternative or optimization against the same 1,024-node/1,023-edge fixture.
- Record paint time, frame gaps, TaskDuration, DOM/heap impact, pointer behavior, and stacking limitations.
- Recommend keeping the current structure or propose a change with its trade-offs.
- If recommending an architectural change, propose a follow-up ADR rather than silently editing ADR-0001.

## Comments
