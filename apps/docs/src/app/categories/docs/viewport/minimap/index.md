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

The minimap draws each node as a rectangle. Every node is drawn by tokens, which you set on the minimap or on any
ancestor, so they follow your theme:

```css
v-minimap {
  --v-minimap-node: var(--muted);
  --v-minimap-node-border: var(--border);
  --v-minimap-node-radius: 8px;
}
```

| Token                      | Default              | Part                                                                    |
| -------------------------- | -------------------- | ----------------------------------------------------------------------- |
| `--v-minimap-node`         | `rgb(226, 226, 226)` | Fill of a node                                                          |
| `--v-minimap-node-border`  | `transparent`        | Outline of a node, one pixel of the minimap wide; `transparent` is none |
| `--v-minimap-node-radius`  | `2px`                | Corner radius of nodes and groups in flow pixels, as the node's own CSS |
| `--v-minimap-group`        | `transparent`        | Fill of a node with children                                            |
| `--v-minimap-group-border` | `--v-minimap-node`   | Outline of a node with children                                         |

By default a group is an outline without a fill, so its members stay visible inside it.

### Style the nodes of a component

To draw the nodes of a component differently, give a style to the key the component is registered under, for every
flow below the injector. The graph itself holds nothing about the minimap:

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

A style has three optional keys; the ones it leaves out keep the tokens:

| Key            | Meaning                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| `background`   | Fill                                                                          |
| `borderColor`  | Color of the outline, one pixel of the minimap wide; `transparent` draws none |
| `borderRadius` | Corner radius in flow pixels, the number of the node's own `border-radius`    |

A color is any CSS color, `var(--token)` included. A large `borderRadius` draws a pill or a circle.

Nodes drawn by a template, or by a component named by its class, have no key: they take the tokens.

### Style a node by its data

A value of `nodeStyles` may be a function of the node instead of an object:

```ts
const FAILED: MinimapNodeStyle = { background: 'var(--danger)' };

withMinimapSettings<Node<Job>>({
  nodeStyles: {
    job: (node) => (node.data?.().failed ? FAILED : undefined),
  },
});
```

The function reads the signals of the node, and the minimap follows them: it runs again when the data of a node
changes, not while nodes move. Return one of a few shared objects, as above, rather than a new color for every node:
nodes with the same colors are painted together.

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
