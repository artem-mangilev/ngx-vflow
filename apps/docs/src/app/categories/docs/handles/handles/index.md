This guide shows how to give nodes handles, the elements that connections start from and end on, and how to place,
style and restrict them. The inputs, attributes and signals are listed in the
[Handle reference](/docs/reference/handle).

## Add handles to a node

Put the `vHandle` directive on an element inside the node presentation. Give it a type and a side:

```html
<span vHandle handleType="target" position="left" class="dot"></span> <span vHandle handleType="source" position="right" class="dot"></span>
```

Core draws nothing for a handle, so give the element a size and a look in your CSS.

> **Info**
> With `@vflow/ui`, use `vuiPort` instead of `vHandle`: it is a handle with the standard port visual and valid/invalid feedback and takes the same inputs: `<span vuiPort handleType="target" position="left"></span>`.

## Give a node several handles

Add one element per handle, and give the handles of the same type a `handleId`; edges refer to it in `sourceHandle`
and `targetHandle`. A handle sits at the center of its parent element on the chosen side, so a handle placed inside
a row lines up with that row.

In the demo every field of a card has a row with its own handle. Connect `Name` to `Greeting`, or a field to both
fields of the other card.

{{ NgDocActions.demoPane("MultipleConnectionPointsDemoComponent") }}

## Connect in either direction

If a handle should both start and accept connections, set `handleType="any"`. The edge then keeps the direction of
the gesture. See [Connections](/docs/handles/connections#handles-of-type-any).

## Let edges float around a node

If edges should meet a node on the side that faces the other end, give the node one handle with `position="auto"`:

```html
<span vHandle handleType="any" position="auto"></span>
```

- If the nodes are drawn over their lines, as in a force-directed graph, use `position="center"` to run edges to the
  node center.
- If one end of an edge should stay on a port, keep a side position there; the floating end then faces the port.

Drag a node of the demo around `Roadmap`: its edge moves to the sides of the two nodes that face each other.

{{ NgDocActions.demoPane("FloatingEdgesDemoComponent") }}

## Make the whole node a handle

Put `vHandle` with `position="auto"` or `position="center"` on the root element of the presentation, and mark the
part that drags the node with `vDragHandle`:

{% raw %}

```html
<div vHandle handleType="any" position="auto">
  <div vDragHandle>{{ title }}</div>
  <div>Drag from here to connect</div>
</div>
```

{% endraw %}

The [Easy connect](/examples/recipes/easy-connect) example builds on this.

## Place a handle yourself

- To move a handle along its side, set `offsetX` and `offsetY`, in flow units.
- To take over positioning, set `layout="manual"` and position the element with your CSS. The connection point is
  then read from the box of the element on the `position` side.

## Show connection feedback

Style the handle by its `data-v-handle-state` attribute, which is `valid` or `invalid` on the handle under a
connection in progress:

```css
.dot[data-v-handle-state='valid'] {
  background-color: green;
}

.dot[data-v-handle-state='invalid'] {
  background-color: red;
}
```

To validate connections with your own rule, see
[Connections](/docs/handles/connections#connection-validation).

## Stop a handle from starting or accepting connections

- To keep a handle from starting connections, set `[canStart]="false"`. A press on it then drags the node.
- To keep it from accepting them, set `[canAccept]="false"`.

Both are reflected in attributes, so a disabled handle can be dimmed:

```css
.dot[data-v-handle-can-start='false'] {
  opacity: 0.5;
}
```

In the demo, turn off `canStart` on `Temperature` and `canAccept` on `Chart`. The handles of `Sensor` are plain
elements styled through the attributes; the handles of `Dashboard` are the handle component of the next section.

{{ NgDocActions.demoPane("CustomHandlesDemoComponent") }}

## Build a handle component

Apply the directive to a component through `hostDirectives`, and forward the inputs that the places using the
component bind, including `handleType` and `position`. Inject `VflowHandleDirective` to read its signals:

```ts
@Component({
  selector: 'square-handle',
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['handleType', 'position', 'handleId', 'canAccept'] }],
  host: {
    class: 'block size-3 rounded-xs border border-solid border-vui-foreground',
    '[class]': 'fill()',
  },
  template: '',
})
export class SquareHandleComponent {
  protected readonly handle = inject(VflowHandleDirective);

  protected readonly fill = computed(() => {
    if (!this.handle.canAccept()) return 'bg-vui-surface opacity-40';

    switch (this.handle.state()) {
      case 'valid':
        return 'bg-vui-success';
      case 'invalid':
        return 'bg-vui-danger';
      default:
        return 'bg-vui-surface';
    }
  });
}
```

```html
<square-handle handleType="target" position="left" handleId="chart" [canAccept]="chartCanAccept()" />
```

## Hide a handle

Hide a handle with `visibility: hidden` or `opacity: 0`, not with `display: none`: a handle outside layout is not
measured, and its edges disappear. If users must still be able to drag from an invisible handle, give it a size.

## Animate a handle on hover

In the default layout the directive sets `transform` on the element. Use the CSS `scale` or `translate` properties
for hover effects, or animate an inner element.
