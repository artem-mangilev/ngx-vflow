# Appearance inventory

Audit of public interfaces, types, public components and rendered feedback, 2026-09-09.
Stage 6 verified the new presentations before removing the compatibility inputs in stage 7.
The following presentation APIs are now removed.

| Removed presentation API                       | Replacement                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| Default node `text`                            | UI `VflowCardNode` data `{ text }`, or application HTML template      |
| Default group `color`                          | `.vui-group` CSS or `--vui-border` / `--vui-surface-muted`            |
| `resizerColor`, resize control `color`         | `--vflow-border`, `.vflow-resize-line`, `.vflow-resize-handle`        |
| Minimap `maskColor`, `strokeColor`             | `--vflow-muted`, `--vflow-border`; canvas resolves editor palette     |
| Alignment `lineColor`                          | `--vflow-selection`, `.vflow-alignment-line`                          |
| Selection-box `color`                          | `--vflow-selection`, `.selection-box`                                 |
| Background string / `color`, `backgroundColor` | `--vflow-background`, `--vflow-muted`, background SVG part selectors  |
| Grid `strokeWidth`                             | `.vflow-background-grid { stroke-width: ... }`                        |
| Marker `color`, `strokeWidth`                  | `.marker__arrow_closed`, `.marker__arrow_default` and general palette |
| Default edge label `text`, `style`             | HTML label template with `vflowEdgeLabel` or own CSS                  |

Position, dimensions, image source/scale/repeat, background pattern spacing, curve routing,
handle ID/direction, resize constraints/gap, snapping tolerance and marker width/height/orientation/units
are geometric or behavioral values. General visible thickness is CSS. Theme synchronization
is described in the UI overview; local node colors are never copied to canvas or toolbar.
