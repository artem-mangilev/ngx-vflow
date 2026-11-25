This guide shows how to place your own elements over the flow: a minimap, viewport controls, a legend, a toolbar.
Such an element stays where it is while the graph pans and zooms. For content that moves with the graph, see
[Content on the canvas](/docs/viewport/portal).

The demo places controls, a minimap and a button. Press the button to move it to the next position.

{{ NgDocActions.demoPane("PanelDemoComponent") }}

## Place an element

Every element inside `<vflow>` that is not a template is rendered above the pane, in a layer the size of the flow.
Add `vPanel` with a position to put it against a corner or a side:

```html
<vflow [nodes]="nodes" [edges]="edges">
  <v-minimap vPanel="bottom-right" />
  <app-zoom-bar vPanel="bottom-left" />
  <div vPanel="top-center">Read-only</div>
</vflow>
```

The positions are `top-left`, `top-center`, `top-right`, `center-left`, `center-right`, `bottom-left`,
`bottom-center` and `bottom-right`. The position is an input, so it can come from a signal:
`[vPanel]="legendCorner()"`.

The directive only positions. The size, the look and the content are the element's own.

## Change the gap to the edge

A panel keeps a `10px` margin to the edges of the flow. The rule has no specificity, so a margin of yours replaces
it:

```css
.legend {
  margin: 16px;
}
```

## Put several elements in one corner

Two panels at the same position overlap. Wrap them in one element that carries `vPanel` and lay them out there:

```html
<div vPanel="bottom-right" class="flex items-end gap-2">
  <app-zoom-bar />
  <v-minimap />
</div>
```

## Position an element yourself

An element without `vPanel` is positioned by your own CSS against the flow. The rules of `vPanel` have no
specificity, so a class of yours also adjusts a panel:

```css
.legend {
  top: 64px;
}
```

The pointer reaches the pane around the elements of the layer; each element takes the pointer over itself.

## Behavior

- The directive sets `data-v-panel="<position>"`; the placement is CSS: `position: absolute`, a margin of `10px` and
  the sides of the position. The rules have no specificity.
- The element is positioned against the flow when it is a direct child of `vflow` or inside wrappers without
  positioning of their own.
- Panels at the same position overlap.
