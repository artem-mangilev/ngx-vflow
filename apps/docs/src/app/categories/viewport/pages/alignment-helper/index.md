The library supports **alignment lines** that help align nodes relative to each other. To enable this feature, pass the `[alignmentHelper]` input to the `VflowComponent`. Its value can be either:

- `true` – to enable the helper with default settings
- An `AlignmentHelperSettings` object – to configure the helper with custom settings

Try aligning the following flow:

{{ NgDocActions.demoPane("AlignmentHelperDemoComponent") }}

# What the dragged node snaps to

While a node is dragged, it snaps to the nearest of these alignments and a guide shows every alignment that holds at its new position:

- **Edges and centers.** The node's left, right, top and bottom edges align with the edges of other nodes in view, and its center with their centers.
- **Equal gaps.** Between two nodes in a row or a column, the node snaps to the middle of the gap. Next to such a pair, it snaps at the distance that separates them, continuing the row. Every gap of the same size along the row is marked.
- **Straight edges.** When the node is connected to another node through handles on facing sides, `left` or `right` on both ends, or `top` or `bottom`, it snaps to where the edge becomes straight. Handles with the `auto` or `center` position meet the node at its center, which center alignment already covers.

A node inside a parent node aligns with the center of its parent, not with the parent's border, and it aligns with nodes outside the parent as usual. A parent does not align with its own children, which move with it.

When several selected nodes are dragged, the selection snaps as a whole, so the nodes keep their distances to each other.

# Settings

`tolerance` is the distance in screen pixels within which a node snaps, the same at any zoom. The default is `10`.

With `snapGrid`, an axis the node aligned on keeps its alignment, and the grid applies to the other axis. A node with `extent: 'parent'` stays inside its parent even when an alignment lies outside it.

Hold `Alt` to move a node freely: while the key is down the node follows the pointer without snapping and no guides are drawn. The key is the `alignmentBypass` entry of [Keyboard shortcuts](../../interactions/keyboard-shortcuts).

The guides are drawn in `--vflow-foreground` at 50% opacity, so they stay in the background of the nodes. Restyle them with ordinary CSS: `.vflow-alignment-guides` is the group, which sets `color` and `opacity` for all of them, `.vflow-alignment-line` the lines and gap marks, and `.vflow-alignment-point` the dots on aligned points.
