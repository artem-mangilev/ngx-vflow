The CSS custom properties core reads and the attributes it writes. Core draws only the feedback that has no markup
of the application: the canvas, the background pattern, the selection box, resize controls, alignment guides, the
connection preview, the minimap and the focus ring.

## State attributes

| Element   | Attributes                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------- |
| Node host | `data-v-node="<id>"`, `data-v-selected`                                                                 |
| Edge host | `data-v-edge="<id>"`, `data-v-selected`                                                                 |
| Handle    | `data-v-handle`, `data-v-handle-type`, `data-v-handle-position`, `data-v-handle-state` and the policies |
| Flow root | `data-v-root`                                                                                           |

`data-v-selected` is also present while the selection box covers the entity, so a presentation shows what a release
will select; the `preselected` signal of the template context tells the two apart.

The node and edge hosts are elements of the library, outside the view of an application component. The handle is an
element of the application. The values of the handle attributes are in the
[Handle reference](/docs/reference/handle#state-attributes).

## Core tokens

| Token                       | Default                  | Part                                                               |
| --------------------------- | ------------------------ | ------------------------------------------------------------------ |
| `--v-background`            | `#fff`                   | The canvas; also the default background of the minimap             |
| `--v-background-pattern`    | `rgb(177, 177, 183)`     | Dots and grid lines                                                |
| `--v-selection-box`         | `#0f4c75`                | Stroke of the selection box; its fill is the same color at 12%     |
| `--v-resize-control`        | `#0f4c75`                | Resize handles and lines                                           |
| `--v-resize-control-border` | `#fff`                   | The border that separates a resize handle from the node            |
| `--v-alignment-guides`      | `#1b262c`                | Alignment guides, drawn at 50%                                     |
| `--v-connection`            | `rgb(177, 177, 183)`     | The line of a connection in progress without a template            |
| `--v-minimap-node`          | `rgb(226, 226, 226)`     | Fill of nodes in the minimap                                       |
| `--v-minimap-node-border`   | `transparent`            | Outline of nodes in the minimap, 1px; `transparent` is none        |
| `--v-minimap-node-radius`   | `2px`                    | Corner radius of nodes and groups in the minimap, in flow pixels   |
| `--v-minimap-group`         | `transparent`            | Fill of nodes with children in the minimap                         |
| `--v-minimap-group-border`  | `--v-minimap-node`       | Outline of nodes with children in the minimap, 1px; not registered |
| `--v-minimap-mask`          | `rgb(240 240 240 / 0.6)` | The minimap mask over the graph outside the viewport               |
| `--v-minimap-viewport`      | `transparent`            | Outline of the viewport in the minimap, 1px                        |
| `--v-focus`                 | `#005fcc`                | Focus halo of nodes and edges                                      |
| `--v-focus-halo`            | `4px`                    | How far the halo reaches beyond a node and to each side of an edge |
| `--v-focus-radius`          | `0px`                    | Corner radius of a focused node, so the halo follows its shape     |
| `--v-node-toolbar-offset`   | `10px`                   | Gap between a node and its toolbar                                 |
| `--v-panel-offset`          | `10px`                   | Gap between a `vPanel` element and the edges of the flow           |

- A token set on the `vflow` element or any ancestor applies to the flow; a value set inside the flow wins for that
  subtree.
- Under `forced-colors: active` core maps its color tokens to system colors (`Canvas`, `GrayText`, `Highlight`,
  `CanvasText`), whatever the theme sets.
- The minimap is drawn with SVG, so its tokens and the colors of node styles are plain CSS: they resolve on the
  `v-minimap` element and follow a theme by themselves. `--v-minimap-node-radius` is read when the paths are built,
  so a change of it alone shows with the next change of the graph.

## `--v-zoom`

Core sets the read-only `--v-zoom` on the flow element to the current zoom. It is written when a viewport change
ends, not on every frame of a gesture.

## Part attributes

| Attribute                                                                      | Part                                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `data-v-background-pattern`                                                    | The background pattern                                                   |
| `data-v-selection-box`                                                         | The selection box                                                        |
| `data-v-resize-control` (`handle` or `line`), `data-v-resize-control-position` | Resize controls, see [Resizing](/docs/nodes/resizer)                     |
| `data-v-alignment-guide` (`line` or `point`)                                   | Alignment guides, see [Snapping and alignment](/docs/viewport/snapping)  |
| `data-v-marker="<type>"`                                                       | An edge marker, see [Markers](/docs/edges/markers)                       |
| `data-v-panel="<position>"`                                                    | An element placed with `vPanel`, see [Panels](/docs/viewport/panel)      |
| `data-v-node-toolbar="<position>"`                                             | A `v-node-toolbar` element, see [Node toolbar](/docs/nodes/node-toolbar) |

These parts are rendered by the library, outside the view of an application component, except the panel and the
node toolbar, which are elements of the application.

## Gesture attributes

| Attribute            | Set by        |
| -------------------- | ------------- |
| `data-v-drag-handle` | `vDragHandle` |
| `data-v-no-drag`     | `vNoDrag`     |
| `data-v-no-pan`      | `vNoPan`      |
| `data-v-no-wheel`    | `vNoWheel`    |
| `data-v-no-select`   | `vNoSelect`   |
| `data-v-no-keyboard` | `vNoKeyboard` |

## See also

- [Styling](/docs/getting-started/styling)
- [@vflow/ui](/packages/ui/overview) maps the core tokens onto the roles of its theme.
