# {{ NgDocPage.title }}

You can customize your edges. To achieve this you need to do this:

1. Change edge type to `template`
2. Create `ng-template` with `edge` selector inside `vflow`
3. Create svg path which you will customize
4. In the `ng-template`, the library provides `let-ctx` with some important data for you, such as the `path` signal with the current path. Additionally, `edge` field contains current edge from one the `[edges]`, from which you can also retrieve custom `data`. Furthermore, you can access `markerStart` and `markerEnd` signals with markers for current `edge`.

## Context

It's tricky to infer type for `let-ctx`, so here is an interface with available fields for this context.

```ts
export interface EdgeContext {
  edge: Edge
  path: Signal<string>
  markerStart: Signal<string>
  markerEnd: Signal<string>
}
```

## Example

{{ NgDocActions.demo("CustomEdgesDemoComponent", { expanded: true }) }}
