This guide shows how to add a minimap, an overview of the whole graph, how to let users navigate with it and how
to style it. Its exact behavior is at the end of this page.

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
  withMinimap({
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

withMinimap<Node<Job>>({
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

The tokens are listed in [Styling](/docs/getting-started/styling#core-tokens).

## Behavior

`VflowMinimapComponent`, selector `v-minimap`, is part of the `Vflow` imports array and goes inside `vflow`. The
element is the block: it has no frame and no position of its own. It draws with SVG that fills it: the nodes
stay in place during pan and zoom, and are drawn again when node geometry or a style changes.

| Input      | Default | Description                    |
| ---------- | ------- | ------------------------------ |
| `pannable` | `false` | Click, drag and scroll panning |
| `zoomable` | `false` | Wheel and trackpad pinch zoom  |

### Block

- By default `width: clamp(120px, 20%, 240px)`, `aspect-ratio: 4 / 3`, `background: var(--v-background)` and `overflow: hidden`, all without specificity. Any CSS of the application changes the size, the background, the border and the radius.
- Place it with [`vPanel`](/docs/viewport/panel) or with your own CSS.

### What it shows

- The bounds of the minimap are the bounds of the nodes united with the viewport, with 5 pixels of padding, so the viewport is always inside the minimap. While the viewport reaches beyond the nodes, the minimap zooms out as the viewport moves.
- A mask of `--v-minimap-mask` covers everything outside the viewport, above the nodes. The viewport is marked at least 8 by 8 pixels large, and outlined with `--v-minimap-viewport`.
- Selection is not shown.

Nodes are drawn by the `--v-minimap-node`, `--v-minimap-node-border` and `--v-minimap-node-radius` tokens, and a node with children by `--v-minimap-group`, `--v-minimap-group-border` and the same radius, see [Styling](/docs/getting-started/styling#core-tokens).

`nodeStyles` of `withMinimap()` maps the key a node component is registered under with `withNodeComponents()` onto a `MinimapNodeStyleRule`: a `MinimapNodeStyle`, or a function `(node: Node) => MinimapNodeStyle | undefined`.

| `MinimapNodeStyle` key | Over token                                              | Description                                                      |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `background`           | `--v-minimap-node` or `--v-minimap-group`               | Fill; any CSS color, `var()` included                            |
| `borderColor`          | `--v-minimap-node-border` or `--v-minimap-group-border` | Outline, one CSS pixel of the minimap wide, centered on the edge |
| `borderRadius`         | `--v-minimap-node-radius`                               | Corner radius in flow pixels, limited to half the shorter side   |

- A style overrides only the keys it sets. Nodes without a key, drawn by a template or by a component named by its class, take the tokens. A node carries no minimap style of its own.
- A rule that is a function is called again when a signal it read changes, or when nodes are added or removed; moving nodes calls no function. Nodes with the same fill and outline are drawn as one path; parents are drawn before their members.
- A `withMinimap()` closer to the flow adds its keys to one further up; a key it sets replaces the rule of that key above.
- Colors are CSS: tokens and `var()` resolve on the `v-minimap` element and follow the theme, see [Styling](/docs/getting-started/styling#core-tokens).
- While the viewport stays within the bounds of the nodes, a pan or a zoom moves only the mask. When the viewport reaches beyond them, every frame draws the nodes again, as one path per style.

### Gestures

- `pannable` enables click/tap, mouse drag, single-finger touch drag, and scroll panning. A click centers the main viewport on the chosen point without changing zoom. A drag begins once the pointer has moved farther than the main flow's `paneClickDistance`, in client-space CSS pixels: it moves the viewport by the movement of the pointer at the current scale of the minimap, and a drag that begins outside the marked viewport centers it on the pressed point first.
- `zoomable` enables wheel and trackpad pinch zoom around the main viewport center. Each wheel event multiplies or divides zoom by half the step of the zoom keys and `zoomIn()` / `zoomOut()` (`√1.2`, about `1.095`), according to scroll direction: a trackpad sends many wheel events per gesture. Zoom respects the main flow's `minZoom` and `maxZoom`.
- Both switches default to `false` and additionally respect the main flow's gesture settings. `panOnDrag` and its permitted mouse buttons control dragging and clicking; the pan activation key can enable these gestures. Selection activation takes priority over panning. `panOnScroll` or the pan activation key routes ordinary scrolling to pan, unless the zoom activation key is held. `zoomOnScroll` or the zoom activation key controls wheel zoom, and `zoomOnPinch` controls trackpad pinch.

A read-only minimap lets the pointer through to the pane. An opted-in minimap captures pointer input only inside its own rectangle and suppresses wheel page scrolling there, including at zoom limits or when a main-flow gesture is disabled. A drag continues outside the minimap using pointer capture; pointer cancellation, lost capture, window blur, or disabling `pannable` ends it.

Two-finger touchscreen pinch, minimap keyboard navigation, and viewport translation bounds are not included.
