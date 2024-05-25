# {{ NgDocPage.title }}

Nodes and edges could be selected!

1. Default nodes and edges are selectable by default, just click and see that one is selected.
2. Custom nodes and edges are not selected by default, you need to mark element that triggers selection by `selectable` directive.

> Both custom nodes and edges has `selected()` signal in their template context for applying styles based on this state.

### Disable selecting

You can pass `[entitiesSelectable]="false"` to `<vflow />` if you want disable selecting for whole flow.

{{ NgDocActions.demo("SelectingDemoComponent", { expanded: true }) }}
