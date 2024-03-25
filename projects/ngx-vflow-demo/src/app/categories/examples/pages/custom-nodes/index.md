# {{ NgDocPage.title }}

> **Warning**
> Be careful with CSS rules applied to node content; custom nodes are implemented with SVG's `foreignObject` element, and Safari has issues with some CSS rules inside `foreignObject`. Therefore, please check this browser when applying complex styling.

This is where things became a lot more interesting. You can create custom nodes with HTML and CSS.

Do the following steps to archieve this:

1. Set `type` of node to `html-template`
2. Provide `ng-template` with `nodeHtml` selector inside `vflow`
3. Write your HTML inside this template
4. You can also pass any data with `data` field on node, and then get it inside `ng-template`

{{ NgDocActions.demo("CustomNodesDemoComponent", { expanded: true }) }}
