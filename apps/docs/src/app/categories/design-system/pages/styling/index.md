CSS custom properties are the public appearance API. Core and UI classes, generated
attributes and DOM nesting are implementation details. Set variables on your own editor,
ancestor or template elements that actually contain the styled part. Missing part variables fall back to semantic tokens, then
standalone core defaults. Do not copy fallback declarations onto every node: that would
shadow inheritance.

## Core part variables

All names below start with `--vflow-`. Lengths require CSS units unless explicitly stated
otherwise. CSS values must be valid for the destination property.

| Suffix                                                                     | Default / purpose                                              |
| -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `resize-handle-color`                                                      | `--vflow-selection`, then `#2e414c`                            |
| `resize-handle-size`                                                       | `6px` width and height                                         |
| `resize-handle-border-color`                                               | `--vflow-surface`, then white                                  |
| `resize-handle-border-width`, `resize-handle-radius`                       | `1px` each                                                     |
| `resize-line-color`                                                        | `--vflow-selection`, then `#2e414c`                            |
| `resize-line-width`, `resize-line-style`                                   | `1px`, `solid`                                                 |
| `alignment-guide-color`                                                    | `--vflow-foreground`, then `#1b262c`                           |
| `alignment-guide-width`                                                    | `1` SVG user unit; a CSS length also works                     |
| `alignment-guide-dash`, `alignment-guide-center-dash`                      | `none`, `4`; SVG dash lists                                    |
| `selection-box-fill`, `selection-box-stroke`                               | `--vflow-selection`, then `#bbe1fa`                            |
| `selection-box-fill-opacity`                                               | `0.12` (number between 0 and 1)                                |
| `selection-box-stroke-width`                                               | `1` SVG user unit                                              |
| `background-dot-color`, `background-grid-color`                            | `--vflow-muted`, then `#b1b1b7`                                |
| `background-dot-size`                                                      | `2px` diameter at zoom 1                                       |
| `background-grid-width`                                                    | `1px` at zoom 1                                                |
| `marker-color`                                                             | `--vflow-muted`, then `#b1b1b7`                                |
| `marker-stroke-width`                                                      | `2px` in the marker's local coordinates                        |
| `marker-scale`                                                             | `1` positive unitless scale around the attachment point        |
| `group-border-color`                                                       | `--vflow-foreground`, then `#1b262c`                           |
| `group-border-width`, `group-radius`                                       | `1.5px`, `5px`; default group presentation                     |
| `group-background`                                                         | Foreground mixed to 5% opacity; default group presentation     |
| `edge-label-background`, `edge-label-color`                                | `--vflow-background` / white, `--vflow-foreground` / `#1b262c` |
| `edge-label-padding`, `edge-label-radius`                                  | `0`; default label presentation                                |
| `edge-label-font-size`, `edge-label-font-weight`, `edge-label-line-height` | `inherit`; default label presentation                          |
| `minimap-mask-color`                                                       | `--vflow-muted`, then `#b1b1b7`                                |
| `minimap-stroke-color`                                                     | `--vflow-border`, then `#c8c8c8`                               |
| `minimap-viewport-color`                                                   | `--vflow-background`, then white                               |
| `minimap-node-fill`                                                        | `--vflow-surface`, then white                                  |
| `minimap-node-stroke`                                                      | `--vflow-foreground`, then `#1b262c`                           |
| `minimap-node-selected-stroke`                                             | `--vflow-selection`, then `#0f4c75`                            |

Dot diameter and grid stroke width scale with camera zoom. Gap/cell size remain graph
pattern settings. Resize positioning, transforms, auto-scaling and hit behavior remain
engine-owned. Marker scale changes the shape, including its stroke, without changing the
edge endpoint or URL. The same variable applies to open and closed arrows.

Resize controls are rendered in the core node wrapper, outside the application's node
template. Set their variables on the editor/ancestor; variables on a nested card do not
travel up to those controls. UI primitives inside the card do inherit card-local variables.

Minimap colors are resolved through CSS before drawing on canvas. Editor/ancestor attribute
changes (including `class`, `style` and theme attributes) refresh them automatically.
After external stylesheet or media changes, call `MiniMapComponent.refreshTheme()`.
Put minimap variables on the editor or its ancestor, not on projected `<mini-map>` content:
the canvas is rendered in the editor layer. Local node colors are not copied into previews.
Color-only refresh does not measure graph nodes or handles.

## UI part variables

All names below start with `--vui-`. They require the UI stylesheet and normally an explicit
UI theme scope. Shared tokens are listed in the [overview](/design-system/overview).

| Suffix                                                           | Default / purpose                                   |
| ---------------------------------------------------------------- | --------------------------------------------------- |
| `node-background`                                                | `--vui-surface`                                     |
| `node-border-width`, `node-border-color`                         | `1px`, `--vui-border`                               |
| `node-radius`, `node-shadow`                                     | `--vui-radius`, `0 3px 10px #0000000a`              |
| `node-header-background`, `node-body-padding`                    | `--vui-surface-muted`, `--vui-space`                |
| `field-min-height`, `field-padding-block`                        | `38px`, `6px`                                       |
| `group-border-width`, `group-border-style`, `group-border-color` | `1px`, `dashed`, `--vui-border`                     |
| `group-radius`, `group-background`                               | `--vui-radius`, muted surface mixed to 55% opacity  |
| `port-size`, `port-radius`                                       | `14px`, `50%`; visual only, not the core hit target |
| `port-border-width`, `port-border-color`                         | `2px`, `--vui-surface`                              |
| `port-color`, `port-valid-color`, `port-invalid-color`           | `--vui-muted`, `--vui-accent`, `--vui-foreground`   |
| `status-success-color`                                           | Light `#166534`, dark `#86efac`                     |
| `status-warning-color`                                           | Light `#854d0e`, dark `#fde047`                     |
| `status-danger-color`                                            | Light `#b91c1c`, dark `#fca5a5`                     |
| `edge-color`, `edge-selected-color`, `edge-width`                | `--vui-muted`, `--vui-accent`, `2px`                |
| `button-background`, `button-color`                              | `--vui-accent`, `--vui-on-accent`                   |
| `bpmn-end-border-width`                                          | `5px`                                               |
| `bpmn-message-dash`, `bpmn-association-dash`                     | `8 5`, `2 5` SVG dash lists                         |

Forced-colors feedback and reduced-motion rules take precedence over decorative overrides.
Preserve contrast and meaningful state distinctions when customizing variables. Variables
that change sizes, typography or spacing can legitimately trigger geometry measurement.
For properties not in this catalogue, compose your own HTML/SVG rather than depending on
internal selectors.

## Breaking appearance migration

These styling inputs/fields have been removed; do not keep them in TypeScript objects or
Angular templates. No silent compatibility path remains in the supported types.

| Removed API                                 | Replacement                                                                                               |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `resizerColor`, resize-control `color`      | `--vflow-resize-handle-color` and `--vflow-resize-line-color`, or shared `--vflow-selection`              |
| Minimap `maskColor`, `strokeColor`          | `--vflow-minimap-mask-color`, `--vflow-minimap-stroke-color`                                              |
| `lineColor` in `AlignmentHelperSettings`    | `--vflow-alignment-guide-color`; retain `tolerance`                                                       |
| `color` in `SelectionBoxSettings`           | `--vflow-selection-box-fill` and `--vflow-selection-box-stroke`; retain `mode`                            |
| Background string shorthand / solid `color` | `--vflow-background`; omit `[background]` or use `{ type: 'solid' }`                                      |
| Dots/grid `color`, `backgroundColor`        | Corresponding dot/grid color variable and `--vflow-background`                                            |
| Dots `size`                                 | `--vflow-background-dot-size` (CSS length); retain `gap`                                                  |
| Grid `strokeWidth`                          | `--vflow-background-grid-width`; old rendering used half the supplied width, so migrate `N` to `N / 2` px |
| Marker `color`, `strokeWidth`               | `--vflow-marker-color`, `--vflow-marker-stroke-width`                                                     |
| Marker `width`, `height`                    | `--vflow-marker-scale`; old `30 × 30` becomes `30 / 16.5 ≈ 1.818182`                                      |
| Default group `color`                       | Group border/background variables; resize colors are independent                                          |
| Default label `style`                       | Default-label variables, or application-owned `edgeLabelHtml` for per-label presentation                  |

Marker types, orientation and units remain marker data. The old fixed-aspect-ratio marker
viewport used the smaller of width and height: to preserve its shape scale, use
`min(oldWidth, oldHeight) / 16.5` (an omitted dimension was `16.5`). New markers allow the
scaled shape to overflow their internal viewport; if you relied on clipping or need separate
per-edge colors/shapes, provide your own SVG marker definitions and URLs in an edge template.
Shared core marker definitions inherit editor variables, not variables placed on a path.

Image `src`, `repeat`, `fixed`, `scale`; grid cell `size`; resize constraints/directions,
`gap`, callbacks and auto-scaling remain API. Content (`text`, application `data`) is not
appearance and is not removed here. Default presentations remain for now; their later
removal is a separate migration.

### Core-only example

```html
<vflow class="my-editor" [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots', gap: 25 }">
  <mini-map />
  <ng-template nodeHtml>
    <div resizable class="my-card">Application content</div>
  </ng-template>
</vflow>
```

```css
.my-editor {
  --vflow-background: #f8fafc;
  --vflow-background-dot-color: #94a3b8;
  --vflow-background-dot-size: 3px;
  --vflow-resize-handle-color: #0f766e;
  --vflow-resize-line-color: #0f766e;
  --vflow-minimap-mask-color: rgb(148 163 184 / 60%);
}
.my-card {
  width: 160px;
  padding: 12px;
}
```

### UI example

```html
<section vflowTheme="light" class="my-theme">
  <vflow [nodes]="nodes" [edges]="edges">
    <ng-template nodeHtml>
      <article vflowNode resizable>
        <header vflowNodeHeader>Application title</header>
        <div vflowNodeBody>Application content</div>
      </article>
    </ng-template>
  </vflow>
</section>
```

```css
.my-theme {
  --vui-accent: #0f766e;
  --vui-node-body-padding: 20px;
  --vui-field-min-height: 44px;
  --vflow-resize-handle-radius: 50%;
}
```

Both examples assume `html-template` nodes. Import `Vflow` for core and additionally
`VflowUi` plus one UI stylesheet for the second example. Add your own handles to nodes
that need connections; custom edge presentation remains application-owned.
