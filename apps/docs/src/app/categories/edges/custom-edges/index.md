You can customize your edges. To achieve this, follow these steps:

1. Put an SVG element with the structural `vEdge` directive inside `vflow`, usually a `<svg:g vEdgeInteractionArea>` group, as in the example below
2. The `vEdgeInteractionArea` group wraps the `<svg:path>` you customize. The flow draws a transparent 20px interaction stroke along the edge path, so a click near the line selects the edge. Without the group the stroke lives in the edge host; the directive moves it into the group as its first child, so the group's listeners and CSS `:hover` see the whole clickable area, and elements you place after it stay on top. Set `interactionWidth` on the edge to change the width.
3. Draw the visible `<svg:path>` inside the group.
4. The library provides `ctx` to the template with important data for you, such as the `path` signal with current path. Additionally, the `edge` field contains current edge from one the `[edges]`, from which you can retrieve custom `data`. Furthermore, you can access `markerStart` and `markerEnd` signals with markers for current `edge`.

```html
<vflow [nodes]="nodes" [edges]="edges">
  <svg:g *vEdge="let ctx" vEdgeInteractionArea>
    <svg:path class="edge" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
  </svg:g>
</vflow>
```

The structural form is short for `<ng-template let-ctx vEdge>`. Use the long form when the template has no single root
element: an edge with a label declares the label next to its SVG group, see `*FeaturesEdgeLabels`, or a template that
starts with `@if` or `@let`.

If your template draws geometry that differs from the edge path, set `interactionWidth` to `0` and opt your own element into hit-testing with `pointer-events="stroke"`; clicks on it still select the edge. Do not enable pointer events on the whole edge SVG because its bounds would block nodes and canvas panning.

## Context

`ctx` is the `EdgeRef` of the edge, the same object an edge component gets from `injectEdge()`:

```ts
export interface EdgeRef<T = any> {
  edge: Edge<T>;
  data: Signal<T>;
  path: Signal<string>;
  markerStart: Signal<string>;
  markerEnd: Signal<string>;
  selected: Signal<boolean>;
  preselected: Signal<boolean>;
  shouldLoad: Signal<boolean>;
}
```

A template cannot take a type argument, so `data` is `any` by default. Name the edges the template renders with `of`
to type it; the flow never reads this input:

{% raw %}

```html
<svg:g *vEdge="let ctx; of: edges" vEdgeInteractionArea>{{ ctx.data().label }}</svg:g>
```

{% endraw %}

## Example

{{ NgDocActions.demoPane("CustomEdgesDemoComponent") }}

## Edge components

An edge can also be drawn by a component. Pass the component class, or a function that lazily imports it, in the `component` field of the edge. Or register the component under a key with `withEdgeComponents()` inside `provideVflow()` and name the key, `component: 'colored'`, as the demo below does; the `VflowEdgeComponents` interface can be augmented to have the keys checked, see [Component keys](../../nodes/custom-nodes#component-keys). The flow creates the component on its own SVG group inside the edge SVG, so the component template is plain SVG and its selector is not used. Read the edge through `injectEdge()`, which returns the same fields as the template context. Add `VflowEdgeInteractionAreaDirective` to its `hostDirectives` to move the interaction stroke into the component host, so host listeners and `:host(:hover)` see the whole clickable area; a click selects the edge either way.

An edge component declares labels in its own template with the `vEdgeLabel` structural directive, next to its SVG
elements, the same way as an edge template; see `*FeaturesEdgeLabels`. A label renders in the HTML label layer of the
flow, outside the component host, so host listeners and `:host(:hover)` do not see it. Put listeners on the label
element itself; the demo below emits the same output from a click on the line and on the label.

Outputs of an edge component reach the `componentEdgeEvent` output of `vflow` with the edge id, the component class, the property name of the output and its payload. `isComponentEdgeEvent(event, Cmp)` narrows an event to the outputs of one edge component class, as `ComponentEdgeEvent<[Cmp]>`.

{{ NgDocActions.demoPane("ComponentEdgesDemoComponent") }}
