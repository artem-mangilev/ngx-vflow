# Appearance migration inventory

Updated 2026-09-10 after the user's explicit correction: public styling uses CSS custom
properties, including part variables; classes are implementation details. See
[ADR-0007](../../docs/adr/0007-css-custom-properties-for-appearance.md).

Appearance API removal is implemented independently of the still-pending default-presentation
removal. The public catalogue and breaking migration examples are in
[Styling and migration](../../apps/docs/src/app/categories/design-system/pages/styling/index.md).

| Removed API                                      | Replacement / retained behavior                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `resizerColor`, resize-control `color`           | Resize handle/line variables; constraints, gap, directions, auto-scale and callbacks retained                                  |
| Minimap `maskColor`, `strokeColor`               | Minimap part variables resolved through CSS probes; navigation inputs and `refreshTheme()` retained                            |
| Alignment `lineColor`                            | Guide color/width/dash variables; tolerance retained                                                                           |
| Selection-box `color`                            | Fill/stroke/opacity/width variables; selection mode retained                                                                   |
| Background color string and solid `color`        | `--vflow-background`; object-only configuration, solid remains the default                                                     |
| Dots/grid `color`, `backgroundColor`             | Pattern part colors plus shared background                                                                                     |
| Dots `size`, grid `strokeWidth`                  | Dot diameter and grid width CSS lengths that scale with zoom; gap/cell size retained                                           |
| Marker `color`, `strokeWidth`, `width`, `height` | Marker color, local stroke width and positive unitless scale around the unchanged attachment point; type/orient/units retained |
| Default group `color`                            | Group border/background variables; removed from create helpers and NodeModel, parent relationships unchanged                   |
| Default label `style`                            | Default-label variables or application-owned HTML; text and placement unchanged                                                |

## Implemented contract

- Shared semantic tokens remain; UI and core part variables fall back at their usage sites.
  No global UI theme installation or host defaults shadowing inherited part variables.
- The previously promoted resize/guide/selection classes and position attribute were removed.
  Tests may inspect internal DOM but only set appearance variables on application elements.
- Minimap resolves CSS color expressions to canvas colors. Ancestor attributes refresh
  automatically; external stylesheet/media changes use `refreshTheme()`. Legacy color inputs
  and background resolution are gone.
- Marker IDs remain scoped per editor. Marker scale applies to its polyline around `(0, 0)`;
  overflow is visible so larger markers are not clipped. The guide documents conversion from
  the old fixed-aspect-ratio viewport sizes and when to use custom SVG definitions instead.
- UI adds part variables for cards, field sizing, groups, ports, status tones, edges, buttons
  and BPMN end/link details. The stylesheet classes are no longer documented as public API.
- Variables follow actual DOM ancestry. Core resize controls are siblings of application
  node templates; use editor/ancestor variables, not a variable on a nested card. Markers,
  toolbar and minimap do not copy card-local variables into their other rendering branches.

## Still pending

Default node/group/edge/label presentations are NOT removed. Their coordinated model,
optimized-handle, minimap and docs-consumer migration remains gated on production acceptance.
The full geometry/performance matrix and user review of scroll/collapse are still pending.
Appearance migration must not be described as completion of all seven stages.
