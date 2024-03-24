# {{ NgDocPage.title }}

You can attach labels to edges by providing `edgeLabels` property to needed `Edge`s. There's 3 slots available for lables on edge: `start`, `center`, `end`. Label is only of a `html-template` type, so you have to provide `<ng-template edgeLabelHtml>` inside `vflow`.

## Context

You may access some data for label through `let-ctx` according to this interface.

```ts
interface EdgeLabelContext {
  // Host edge for current label
  edge: Edge
  // Current label
  label: EdgeLabel
}
```

## Example

{{ NgDocActions.demo("LabelsDemoComponent", { expanded: true }) }}
