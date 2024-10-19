# {{ NgDocPage.title }}

You can attach labels to edges by providing the `edgeLabels` property to the needed `Edge`s. There are three slots available for labels on an edge: `start`, `center`, `end`. The label is only of the `html-template` type, so you have to provide `<ng-template edgeLabelHtml>` inside `vflow`.

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

{{ NgDocActions.demoPane("LabelsDemoComponent") }}
