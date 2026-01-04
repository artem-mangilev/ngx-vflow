Nodes and edges can be selected!

1. Default nodes and edges are selectable by default; just click and see that one is selected.
2. Custom nodes and edges are not selectable by default, you need to mark the element that triggers selection with the `selectable` directive.

> Both custom nodes and edges have the `selected()` signal in their template context for applying styles based on this state.

### Disable selecting

You can pass `[entitiesSelectable]="false"` to `<vflow />` if you want disable selecting for whole flow.

{{ NgDocActions.demoPane("SelectingDemoComponent") }}
