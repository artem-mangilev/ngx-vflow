This guide shows how to add a minimap, an overview of the whole graph, how to let users navigate with it and how
to style it. Its inputs and exact behavior are in the [Viewport reference](/docs/reference/viewport#minimap).

The graph of the demo is wider than its pane: the minimap shows all of it and marks the part in view. Click, drag
or scroll the minimap to move around. Pan the flow far away from the nodes: the minimap zooms out, so the part in
view never leaves it.

{{ NgDocActions.demoPane("MinimapDemoComponent") }}

## Add a minimap

Put `<v-minimap>` inside `<vflow>` and place it in a corner with [`vPanel`](/docs/viewport/panel):

```html
<vflow [nodes]="nodes" [edges]="edges">
  <v-minimap vPanel="bottom-right" />
</vflow>
```

Without `vPanel` the minimap is an ordinary block of the flow content, which you place with your own CSS.

## Show it on demand

The minimap is content of the flow like any other, so a condition adds and removes it:

```html
<vflow [nodes]="nodes">
  @if (showMinimap()) {
  <v-minimap vPanel="bottom-right" />
  }
</vflow>
```

## Let users navigate with it

By default the minimap is a read-only overview. Turn on the gestures you want:

```html
<vflow [nodes]="nodes" [edges]="edges">
  <v-minimap vPanel="bottom-right" [pannable]="true" [zoomable]="true" />
</vflow>
```

- With `pannable`, a click centers the viewport on that point, and a drag or a scroll pans it.
- With `zoomable`, the wheel and a trackpad pinch zoom the viewport.

Both follow the gesture settings of the flow: if `panOnDrag` is off, the minimap does not pan on drag either.

## Style the block

The `v-minimap` element is the block itself and has no frame. Size it and give it a border, a radius, a shadow or
another background with CSS, from a global stylesheet or from the styles of the component whose template holds it:

```css
v-minimap {
  width: 240px;
  height: 160px;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.12);
}
```

By default it is a fifth of the width of the flow, between 120 and 240 pixels, with an aspect ratio of 4:3, on the
background of the flow. The defaults have no specificity, so any rule of yours wins.

## Style the nodes

The minimap draws each node as a rectangle filled with the `--v-minimap-node` token. To change the color of every
node, set the token, on the minimap or on any ancestor:

```css
v-minimap {
  --v-minimap-node: var(--muted);
}
```

To draw some nodes differently, give them a style, an object of four optional keys:

| Key            | Meaning                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| `background`   | Fill                                                                             |
| `borderColor`  | Color of the outline                                                             |
| `borderWidth`  | Width of the outline in pixels of the minimap; it does not shrink with the graph |
| `borderRadius` | Corner radius in flow units, the number of the node's own `border-radius`        |

A color is any CSS color, `var(--token)` included, so the minimap follows your theme. A large `borderRadius` draws
a pill or a circle.

Set a style at two levels. Each one overrides only the keys it names:

1. Every node of a component, by the key the component is registered under, for all flows of the application:

   ```ts
   provideVflow(
     withNodeComponents({ task: TaskNode, decision: DecisionNode }),
     withMinimapSettings({
       nodeStyles: {
         task: { background: 'var(--task)' },
         decision: { background: 'var(--decision)', borderRadius: 999 },
       },
     }),
   );
   ```

2. One node, with its `minimap` field. Like the other fields of a node it is a signal, so it can change later:

   ```ts
   createNodes([
     { id: 'draft', component: 'task', point: { x: 0, y: 0 } },
     { id: 'failed', component: 'task', point: { x: 240, y: 0 }, minimap: { background: 'var(--danger)' } },
   ]);
   ```

A node with children is drawn as an outline of the node color without a fill, so its members stay visible. To fill
a group, give its component or the node itself a `background`.

The minimap does not show which nodes are selected.

## Change the mask

The part of the graph outside the viewport is dimmed by a mask. Set its color, and an outline for the viewport,
with tokens on the minimap or on any ancestor:

```css
v-minimap {
  --v-minimap-mask: rgb(0 0 0 / 0.08);
  --v-minimap-viewport: var(--accent);
}
```

The tokens are listed in [Tokens and attributes](/docs/reference/styling#core-tokens).
