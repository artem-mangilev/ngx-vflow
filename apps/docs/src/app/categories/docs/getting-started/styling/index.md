This guide shows how to style a flow. Nodes, edges, labels and handles are your markup, so most of it is your own
CSS; core adds attributes that carry the state of each element, and tokens for the few parts it draws itself. Both
are listed at the end of this page.

## Style a node or an edge by its state

Read the state as a signal in the presentation and bind a class to it:

```html
<div *vNode="let ctx" class="card" [class.card--selected]="ctx.selected()">…</div>
```

If several presentations share one stylesheet, select by the attributes core writes on the host of a node or an
edge instead:

```css
[data-v-selected] .card {
  border-color: royalblue;
}
```

Put such rules into a global stylesheet. The host is an element of the library, so a selector that starts at
`[data-v-selected]` does not match under the emulated view encapsulation of a component.

## Style a handle

A handle is your own element, so its attributes work in component styles:

```css
.port[data-v-handle-state='valid'] {
  background: seagreen;
}
```

## Recolor the parts core draws

Set the core tokens on the `vflow` element or an ancestor:

```css
.editor {
  --v-background: #f8fafc;
  --v-background-pattern: #cbd5e1;
  --v-selection-box: #2563eb;
  --v-focus: #2563eb;
}
```

## Reshape a part core draws

A token changes a color. For size and shape, select the part by its attribute in a global stylesheet:

```css
[data-v-resize-control='handle'] {
  border-radius: 50%;
}
```

## Add a dark theme

Give the tokens their dark values under the selector your application uses for its dark mode, and style your own
presentations the same way:

```css
.dark .editor {
  --v-background: #18181b;
  --v-background-pattern: #3f3f46;
  --v-resize-control-border: #18181b;
  --v-alignment-guides: #fafafa;
}
```

## Keep a detail the same size at every zoom

Divide by the read-only `--v-zoom` token:

```css
.card {
  border-width: calc(1px / var(--v-zoom, 1));
}
```

## Support high contrast

Core switches its own parts to system colors under `forced-colors: active`. Do the same for your presentations
where color alone carries a meaning:

```css
@media (forced-colors: active) {
  .card--selected {
    outline: 2px solid Highlight;
  }
}
```

## Put the flow above or below the page

The `vflow` element is its own stacking context. The `z-index` of nodes, edges and the minimap orders them inside the
flow only, so dialogs and menus of the application stay above it. To layer the flow as a whole, set `z-index` on the
`vflow` element or its container.

## Use a ready theme

If you would rather not style everything yourself, [@vflow/ui](/packages/ui/overview) ships node, port and edge
parts with light and dark themes, and one accent color restyles the parts and core together.

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
element of the application. The values of the handle attributes are in
[Handles](/docs/handles/handles#show-connection-feedback).

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

- A token set on the `vflow` element or any ancestor applies to the flow; a value set inside the flow wins for that
  subtree.
- Under `forced-colors: active` core maps its color tokens to system colors (`Canvas`, `GrayText`, `Highlight`,
  `CanvasText`), whatever the theme sets.
- The minimap is drawn with SVG, so its tokens and the colors of node styles are plain CSS: they resolve on the
  `v-minimap` element and follow a theme by themselves. `--v-minimap-node-radius` is read when the paths are built,
  so a change of it alone shows with the next change of the graph.
- `--v-zoom` is read-only: core sets it on the flow element to the current zoom when a viewport change ends, not on
  every frame of a gesture.

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
