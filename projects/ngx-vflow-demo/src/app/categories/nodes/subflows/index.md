---
keyword: 'FeaturesSubflows'
---

A subflow is a node that can contain child nodes. Key things about subflows:

- Any node type may be a parent node. The `default-group` and `template-group` types provide dedicated group presentation but are not required for the parent relationship.
- To associate a node with a subflow, set the `parentId` to the ID of the subflow.
- Nodes within a subflow have coordinates _relative_ to that subflow.
- A parent node retains the connection behavior of its node type; `template-group` is the group type that can expose handles.
- Use the `groupNode` directive on an `ng-template` to define a custom subflow with native HTML. Size the top-level element with the `ctx.width()` and `ctx.height()` signals, as shown in the example.

{{ NgDocActions.demoPane("SubflowsDemoComponent") }}

## See also

- `DefaultGroupNode`
- `TemplateGroupNode`
