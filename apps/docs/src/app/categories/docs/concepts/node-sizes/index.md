A node editor has to know how large every node is: edges end at its sides, handles sit on its border, the minimap
and `fitView()` need its bounds. This page explains where that size comes from and why the library keeps two notions
of it apart.

## Two modes per axis

Each axis of a node, the width and the height, is in one of two modes:

- `auto`: the axis follows the content. The library measures the rendered node and writes no inline size for it.
  This is the mode of an axis whose node has no `width` or `height` signal.
- `explicit`: the axis has a fixed size that the library renders inline. An axis is explicit when the node carries
  its signal, or after a resize gesture changes it. Content larger than an explicit size does not grow the node.

The axes are independent. A node with only `width` has a fixed width and a height that follows its content, which is
what a card with wrapping text usually wants.

The default is `auto` because a node is your markup. A card with a title and three rows already has a size, the one
CSS gives it, and asking the application to repeat it in data would mean two sources that drift apart as soon as a
font or a label changes.

## The size you ask for and the size that is rendered

The `width` and `height` signals of a node hold the size your application asks for. They are intent: only a resize
gesture writes them, and measurement never does.

The rendered size is what the browser drew, the measured box. It equals the explicit size unless CSS `min-*` or
`max-*` on the element clamps it. Edges, handles and bounds use the rendered size, and you read it with
`ctx.width()` and `ctx.height()` in a presentation, or with `getNodeRect()` and `getNodesBounds()` on the flow.

Keeping the two apart is what makes the model predictable. If measurement wrote into `width`, a content-sized node
would become fixed the first time it rendered and stop following its content, and every snapshot of the graph would
carry sizes nobody chose. With the split, a saved graph holds only the sizes someone set, and a content-sized node
stays content-sized after a reload.

The same reasoning is why the flow never adds signals to your node objects. A node resized by the user without a
size signal keeps its size inside the flow, and the `size` change reports it; the application decides whether that
size becomes part of its data. [Resizing](/docs/nodes/resizer#save-the-size-a-user-set) shows how.

## One element is the box

The element with the `vResizable` directive is the sizing box of its node. The library sets the inline width or
height of each explicit axis on that element, and positions the resize controls and the handles against the same
box, so the three always describe one rectangle.

While any axis is explicit the element gets `box-sizing: border-box`, so padding and border stay inside the size a
user drags to. Otherwise a card dragged to 200 pixels would render 200 pixels plus its padding, and the control
under the pointer would run away from it.

Two consequences follow for your CSS. A percentage size such as `width: 100%` on that element resolves against the
node wrapper, which is itself sized by its content, so it does not mean "as wide as the node". And CSS limits keep
working: the resizer respects `min-width`, `max-height` and the others, in both modes.

## What a change of size reports

`(nodesChanges.size)` reports every change of the rendered size together with the mode of each axis. The mode is the
part that matters for persistence: an `explicit` axis is a decision worth saving, an `auto` axis is a measurement
of the content, and writing it back as `width` or `height` would freeze the node.

## See also

- [Resizing](/docs/nodes/resizer) for the tasks: making a node resizable, limiting and saving its size.
- [Resizer reference](/docs/reference/resizer) for the inputs, events and attributes.
- [Core concepts](/docs/concepts/core-concepts#what-the-flow-writes) for which signals the flow writes.
