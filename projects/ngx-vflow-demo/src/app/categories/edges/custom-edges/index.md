You can customize your edges. To achieve this, follow these steps:

1. Change the edge type to `template`
2. Create an `ng-template` with the `edge` selector inside `vflow`
3. Create an `<svg:path>` which you will customize. Optionally — **but recommended** — wrap it in a `<svg:g customTemplateEdge>` element. The wrapper adds a 20px interaction stroke while leaving the rest of the edge SVG transparent to pointer input. Add `selectable` to the wrapper when the edge should participate in the flow's selection behavior.
4. In the `ng-template`, the library provides `let-ctx` with important data for you, such as the `path` signal with current path. Additionally, the `edge` field contains current edge from one the `[edges]`, from which you can retrieve custom `data`. Furthermore, you can access `markerStart` and `markerEnd` signals with markers for current `edge`.

If you provide your own interaction path instead of using `customTemplateEdge`, opt that path into hit-testing with `pointer-events="stroke"`. Do not enable pointer events on the whole edge SVG because its bounds would block nodes and canvas panning.

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
