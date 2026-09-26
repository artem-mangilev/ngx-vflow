---
keyword: 'FeaturesSubflows'
---

A subflow is a node that can contain child nodes. Key things about subflows:

- A group is an ordinary node with `width` and `height`. There is no separate group type or group template: any node may be a parent node.
- To associate a node with a subflow, set the `parentId` to the ID of the subflow.
- Nodes within a subflow have coordinates _relative_ to that subflow.
- A parent node draws its own handles like any other node, so it can take part in connections.
- To draw groups differently from other nodes, mark them in `data` (the example uses `type: 'group'`) and branch on it in the `node` template. Size the top-level element with the `ctx.width()` and `ctx.height()` signals, as shown in the example.
- A node with children is read out as a `group` by assistive technology; its name still defaults to `Node {id}`.

{{ NgDocActions.demoPane("SubflowsDemoComponent") }}

## See also

- `Node`
- `*FeaturesCustomNodes`
