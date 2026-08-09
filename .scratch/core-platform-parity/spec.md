# Core platform parity

This effort turns the agreed critical feature gaps into a coherent public-platform program for ngx-vflow. It is based on the [competitive feature-gap matrix](../competitive-feature-gap/feature-gap-matrix.md) and preserves [ADR-0002](../../docs/adr/0002-application-owned-graph-state.md).

## Goal

Bring ngx-vflow's core platform contract to parity with mature node-based UI engines in seven areas:

- accessibility and keyboard operation;
- a stable public graph facade;
- per-entity capability policies;
- structural deletion orchestration;
- public graph, change, path, bounds, viewport, and coordinate utilities;
- configurable viewport/input policy and constraints;
- an interactive, accessible minimap.

## State boundary

- The application owns the authoritative graph state.
- Core may synchronously update application-provided `WritableSignal` values for interactive properties such as position, selection, and size.
- Adding, removing, or reparenting entities remains a structural graph change that the application applies.
- Public APIs must not require consumers to import `ɵ` services or adopt an internal graph store.

## Delivery principles

- Prefer deep framework-neutral modules where no live rendered state is required: a small cohesive interface should hide topology, cascade, and geometry complexity rather than mirror internal services.
- Put DOM measurements and rendered-instance queries behind one stable public facade. The facade must earn its seam by removing consumer knowledge of internal models, not by passing through every `ɵ` method.
- Define entity policies before accessibility and deletion depend on them.
- Keep keyboard behavior configurable and safe around inputs, contenteditable regions, and embedded controls.
- Keep the minimap SVG lightweight; do not render a second Angular node tree.
- Treat each public interface as its module's test surface; tests should assert observable results without reaching past the seam into internal services.
- Add focused public-contract tests and documentation with each issue rather than postponing them to a cleanup ticket.

## Non-goals

- Valuable-parity work: runtime grouping, rotation, generic event expansion, richer port policies, touch gestures, Panel/EdgeToolbar/Controls, and richer edge flags or labels.
- The deferred waypoint API design.
- History, clipboard, commands, palette UI, and automatic layouts beyond official demos.
- Save/load, SSR, export, advanced routing, execution, BPMN/UML, collaboration, persistence, or whiteboard features.

## Dependency order

| Phase                 | Foundation                                                                                     | Enables                                               |
| --------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| A — public contracts  | 01 capability policy; 02 topology/bounds utilities; 03 change utilities; 04 geometry utilities | Facade, deletion, accessibility, viewport constraints |
| B — platform behavior | 05 public facade; 06 deletion lifecycle; 07 gesture policy; 08 constraints/auto-pan            | Keyboard operation and consistent navigation          |
| C — accessibility     | 09 semantics; 10 focus/navigation; 11 keyboard editing/announcements                           | Complete keyboard-operable graph                      |
| D — minimap           | 12 navigation; 13 presentation/accessibility                                                   | Complete interactive minimap                          |

This is a dependency order, not a release commitment. Independent issues may proceed in parallel after their prerequisites are settled.

## Issues

1. [Implement per-entity capability policies](issues/01-implement-entity-capability-policies.md)
2. [Publish graph topology and bounds utilities](issues/02-publish-graph-topology-utilities.md)
3. [Publish structural graph operation helpers](issues/03-publish-graph-change-utilities.md)
4. [Publish path, viewport, and coordinate utilities](issues/04-publish-geometry-utilities.md)
5. [Expose a stable public flow facade](issues/05-expose-public-flow-facade.md)
6. [Add a structural deletion request lifecycle](issues/06-add-deletion-request-lifecycle.md)
7. [Make viewport gesture policy configurable](issues/07-configure-viewport-gestures.md)
8. [Add viewport and node movement constraints](issues/08-add-viewport-and-node-constraints.md)
9. [Establish graph accessibility semantics](issues/09-establish-accessibility-semantics.md)
10. [Implement keyboard focus and graph navigation](issues/10-implement-keyboard-navigation.md)
11. [Implement keyboard editing and live announcements](issues/11-implement-keyboard-editing-and-announcements.md)
12. [Make the minimap navigable](issues/12-make-minimap-navigable.md)
13. [Add minimap presentation and accessibility hooks](issues/13-add-minimap-presentation-hooks.md)
