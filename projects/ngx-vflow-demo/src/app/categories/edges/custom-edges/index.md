You can customize your edges. To achieve this, follow these steps:

1. Change the edge type to `template`
2. Create an `ng-template` with the `edge` selector inside `vflow`
3. Create an `<svg:path>` which you will customize. Optionally — **but recommended** — wrap it in a `<svg:g customTemplateEdge>` element. This adds some UX improvements to the path; for example, it increases the clickable area of the path.
4. In the `ng-template`, the library provides `let-ctx` with important data for you, such as the `path` signal with current path. Additionally, the `edge` field contains current edge from one the `[edges]`, from which you can retrieve custom `data`. Furthermore, you can access `markerStart` and `markerEnd` signals with markers for current `edge`.

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
