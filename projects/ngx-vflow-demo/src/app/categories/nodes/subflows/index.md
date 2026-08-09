---
keyword: 'FeaturesSubflows'
---

A subflow is a node that can contain child nodes. Key things about subflows:

- To create a subflow, you need to use a `default-group` or `template-group` `type` on `Node`.
- To associate a node with a subflow, set the `parentId` to the ID of the subflow.
- Nodes within a subflow have coordinates _relative_ to that subflow.
- A subflow is itself a node, so it can act as a source or a target (this functionality is available only for `template-group` subflows).
- Use the `groupNode` directive on an `ng-template` to define a custom subflow with native HTML. Size the top-level element with the `ctx.width()` and `ctx.height()` signals, as shown in the example.

{{ NgDocActions.demoPane("SubflowsDemoComponent") }}

## See also

- `DefaultGroupNode`
- `TemplateGroupNode`
