This guide shows how to add a minimap, an overview of the whole graph in a corner of the flow, and how to let users
navigate with it. Its inputs and exact behavior are in the [Viewport reference](/docs/reference/viewport#minimap).

The graph of the demo is wider than its pane: the minimap shows all of it and marks the part in view. Click, drag
or scroll the minimap to move around.

{{ NgDocActions.demoPane("MinimapDemoComponent") }}

## Add a minimap

Put `<v-minimap />` directly inside `<vflow>`:

```html
<vflow [nodes]="nodes" [edges]="edges">
  <v-minimap />
</vflow>
```

To move it to another corner, set `position`, for example `position="top-left"`.

## Show it on demand

The flow projects the minimap by its selector, so a condition adds and removes it:

```html
<vflow [nodes]="nodes">
  @if (showMinimap()) {
  <v-minimap />
  }
</vflow>
```

## Wrap it in your own component

A wrapper component needs nothing extra: the flow renders every element of its content above the pane, the minimap
inside a wrapper included.

```html
<vflow [nodes]="nodes">
  <app-minimap />
</vflow>
```

## Let users navigate with it

By default the minimap is a read-only overview. Turn on the gestures you want:

```html
<vflow [nodes]="nodes" [edges]="edges">
  <v-minimap [pannable]="true" [zoomable]="true" />
</vflow>
```

- With `pannable`, a click centers the viewport on that point, and a drag or a scroll pans it.
- With `zoomable`, the wheel and a trackpad pinch zoom the viewport.

Both follow the gesture settings of the flow: if `panOnDrag` is off, the minimap does not pan on drag either.

## Change its colors

Set the `--v-minimap-mask` and `--v-minimap-selected` tokens, see
[Tokens and attributes](/docs/reference/styling#core-tokens). Nodes are filled with `--v-background`.
