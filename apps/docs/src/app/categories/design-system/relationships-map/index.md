Teams are groups, and Infra is a team inside Platform. Drag a person by the name onto another team: they land in
the nearest free spot of the innermost team under the pointer, and a team without room turns red and sends the
person back. Drag from the body of one card to another to connect two people; select a connection and press Delete
to remove it. Head counts follow every move. Select a team to resize it; it cannot shrink past its members.

{{ NgDocActions.demo("RelationshipsDemoComponent", { container: false }) }}

```typescript file="./relationships-demo.component.ts"

```

## What this page proves

- A `vuiGroup` on a group node (a node with a size and children) carries its own edges; membership of people in a team is graph data (`parentId`), not a visual rule.
- Groups nest: a child group is positioned in its parent and stays inside it like any child.
- Floating edges: `vHandle` with `position="auto"` meets every node on the side facing the other end, so edges stay clean as people move. The card is the handle; `vDragHandle` on its name row keeps dragging the node.
- Moving between groups is application policy built on drag events: `extent` is lifted while a person is dragged, and on release the application picks the team with `getNodesAtPoint` and a free spot from `getNodeRect`, then writes `parentId` and the point.
- `vResizable` on the group resizes it; children with `extent: 'parent'` (the default with a parent) set the smallest size.
- A note is a `vuiNode` without a handle: canvas content that takes part in selection but not in the graph. A metric links to its team with a dashed edge.
- Images and metrics are plain SVG and HTML inside `vuiNodeBody`; the library ships no chart or image component.
