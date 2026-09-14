You can customize your edges. To achieve this, follow these steps:

1. Create an `ng-template` with the `edge` selector inside `vflow`
2. Wrap the `<svg:path>` you customize in a `<svg:g edgeInteraction>`. The directive draws a transparent 20px interaction stroke along the edge path as the first child of the group, so a click near the line selects the edge, the group's listeners and CSS `:hover` see the whole clickable area, and elements you place after it stay on top. Without it the edge has no hit area. Set `interactionWidth` on the edge to change the width.
3. Draw the visible `<svg:path>` inside the group.
4. In the `ng-template`, the library provides `let-ctx` with important data for you, such as the `path` signal with current path. Additionally, the `edge` field contains current edge from one the `[edges]`, from which you can retrieve custom `data`. Furthermore, you can access `markerStart` and `markerEnd` signals with markers for current `edge`.

If your template draws geometry that differs from the edge path, set `interactionWidth` to `0` or leave out `edgeInteraction` and opt your own element into hit-testing with `pointer-events="stroke"`; clicks on it still select the edge. Do not enable pointer events on the whole edge SVG because its bounds would block nodes and canvas panning.

## Context

It's tricky to infer type for `let-ctx`, so here is an interface with available fields for this context.

```ts
export interface EdgeContext {
  edge: Edge;
  path: Signal<string>;
  markerStart: Signal<string>;
  markerEnd: Signal<string>;
}
```

## Example

{{ NgDocActions.demoPane("CustomEdgesDemoComponent") }}

## Edge components

An edge can also be drawn by a component. Pass the component class, or a function that lazily imports it, in the `component` field of the edge. The flow creates the component on its own SVG group inside the edge SVG, so the component template is plain SVG and its selector is not used. Read the edge through `injectEdge()`, which returns the same fields as the template context. Add `EdgeInteractionDirective` to its `hostDirectives` to give the edge a hit area: the stroke goes into the component host, a click selects the edge, and host listeners and `:host(:hover)` see the whole clickable area.

An edge component declares labels in its own template with the `edgeLabel` structural directive, next to its SVG
elements, the same way as an edge template; see `*FeaturesEdgeLabels`. A label renders in the HTML label layer of the
flow, outside the component host, so host listeners and `:host(:hover)` do not see it. Put listeners on the label
element itself; the demo below emits the same output from a click on the line and on the label.

Outputs of an edge component reach the `componentEdgeEvent` output of `vflow` with the edge id, the property name of the output and its payload. The `ComponentEdgeEvent` type narrows these events for a list of edge component classes.

{{ NgDocActions.demoPane("ComponentEdgesDemoComponent") }}
