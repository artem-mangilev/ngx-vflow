Teams are groups, and Infra is a team inside Platform. Drag a person onto another team to move them there: the
innermost team under the pointer wins, and a drop outside every team returns the person to their own. Head counts
follow the moves. Select a team to resize it; it cannot shrink past its members.

{{ NgDocActions.demo("RelationshipsDemoComponent", { container: false }) }}

```typescript file="./relationships-demo.component.ts"

```

## What this page proves

- A `vuiGroup` on a group node (a node with a size and children) carries its own handles and edges; membership of people in a team is graph data (`parentId`), not a visual rule.
- Groups nest: a child group is positioned in its parent and stays inside it like any child.
- Moving between groups is application policy built on drag events: `extent` is lifted while a person is dragged, and on release the application picks the team with `getNodesAtPoint`, then writes `parentId` and a point inside it from `getNodeRect`.
- `vResizable` on the group resizes it; children with `extent: 'parent'` (the default with a parent) set the smallest size.
- A note is a `vuiNode` without handles: canvas content that takes part in selection but not in the graph.
- Images and metrics are plain SVG and HTML inside `vuiNodeBody`; the library ships no chart or image component.
