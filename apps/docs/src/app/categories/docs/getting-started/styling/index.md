Nodes, edges, labels and handles are your markup, so you style them with your own CSS. Core adds two things to
work with: attributes that carry the state of each element, and a small set of tokens for the few parts core draws
itself.

## Style a presentation from its state

A template or a component reads the state as signals and binds classes to it:

```html
<div *vNode="let ctx" class="card" [class.card--selected]="ctx.selected()">…</div>
```

Core also writes the state to the DOM, which suits a stylesheet shared by several presentations:

| Element   | Attributes                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------- |
| Node host | `data-v-node="<id>"`, `data-v-selected`, `data-v-preselected`                                           |
| Edge host | `data-v-edge="<id>"`, `data-v-selected`, `data-v-preselected`                                           |
| Handle    | `data-v-handle`, `data-v-handle-type`, `data-v-handle-position`, `data-v-handle-state` and the policies |
| Flow root | `data-v-root`                                                                                           |

```css
[data-v-selected] .card {
  border-color: royalblue;
}

.port[data-v-handle-state='valid'] {
  background: seagreen;
}
```

The node and edge hosts are elements of the library, outside the view of your component. A selector that starts
at `[data-v-selected]` therefore does not match under the emulated view encapsulation of a component: put such rules
into a global stylesheet, or bind classes from `ctx.selected()` as above. A handle is your own element, so its
attributes work in component styles. [Handles](/docs/handles/handles#state) lists the handle states.

## Core tokens

Core draws the feedback that has no markup of yours: the canvas, the background pattern, the selection box, resize
controls, alignment guides, the connection preview, the minimap and the focus ring. Each takes its color from a CSS
custom property with a default, so a flow works without any setup.

| Token                       | Default              | Part                                                               |
| --------------------------- | -------------------- | ------------------------------------------------------------------ |
| `--v-background`            | `#fff`               | The canvas; also fills nodes in the minimap                        |
| `--v-background-pattern`    | `rgb(177, 177, 183)` | Dots and grid lines                                                |
| `--v-selection-box`         | `#0f4c75`            | Stroke of the selection box; its fill is the same color at 12%     |
| `--v-resize-control`        | `#0f4c75`            | Resize handles and lines                                           |
| `--v-resize-control-border` | `#fff`               | The border that separates a resize handle from the node            |
| `--v-alignment-guides`      | `#1b262c`            | Alignment guides, drawn at 50%                                     |
| `--v-connection`            | `rgb(177, 177, 183)` | The line of a connection in progress without a template            |
| `--v-minimap-mask`          | `rgb(177, 177, 183)` | The minimap mask outside the viewport, at 35%, and node outlines   |
| `--v-minimap-selected`      | `#0f4c75`            | Outline of selected nodes in the minimap                           |
| `--v-focus`                 | `#005fcc`            | Focus halo of nodes and edges                                      |
| `--v-focus-halo`            | `4px`                | How far the halo reaches beyond a node and to each side of an edge |
| `--v-focus-radius`          | `0px`                | Corner radius of a focused node, so the halo follows its shape     |
| `--v-node-toolbar-offset`   | `10px`               | Gap between a node and its toolbar                                 |

Set a token on the `vflow` element or any ancestor; a value set inside the flow wins for that subtree:

```css
.editor {
  --v-background: #f8fafc;
  --v-background-pattern: #cbd5e1;
  --v-selection-box: #2563eb;
  --v-focus: #2563eb;
}
```

Core also sets the read-only `--v-zoom` on the flow element, so scaled content can keep screen-sized details:
`border-width: calc(1px / var(--v-zoom, 1))`. It is written when a viewport change ends, not on every frame of a
gesture.

## Reshape a core part

A token changes a color. For size and shape, each part has a public attribute to select it:

| Attribute                                                                      | Part                                                                    |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `data-v-background-pattern`                                                    | The background pattern                                                  |
| `data-v-selection-box`                                                         | The selection box                                                       |
| `data-v-resize-control` (`handle` or `line`), `data-v-resize-control-position` | Resize controls, see [Resizing](/docs/nodes/resizer)                    |
| `data-v-alignment-guides`, `data-v-alignment-guide` (`line` or `point`)        | Alignment guides, see [Snapping and alignment](/docs/viewport/snapping) |
| `data-v-marker="<type>"`                                                       | An edge marker, see [Markers](/docs/edges/markers)                      |

These parts are rendered by the library, so the rules belong in a global stylesheet.

## Dark theme

A theme is a scope that sets the tokens. Give the tokens their dark values under the selector your application uses
for its dark mode, and style your own presentations the same way:

```css
.dark .editor {
  --v-background: #18181b;
  --v-background-pattern: #3f3f46;
  --v-resize-control-border: #18181b;
  --v-alignment-guides: #fafafa;
}
```

The minimap is a canvas: it samples the resolved tokens and repaints when an attribute or a class changes on an
ancestor of the flow, or when `prefers-color-scheme` changes.

## High contrast

Under `forced-colors: active` core maps its tokens to system colors (`Canvas`, `GrayText`, `Highlight`), whatever
the theme sets. Do the same for your presentations where color alone carries a meaning.

## A ready theme

[@vflow/ui](/packages/ui/overview) ships node, port and edge parts with light and dark themes and maps the core
tokens onto its own roles, so one accent color restyles the parts and core together.
