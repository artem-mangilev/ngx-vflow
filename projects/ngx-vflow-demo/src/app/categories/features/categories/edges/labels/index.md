# {{ NgDocPage.title }}

You can attach labels to edges by providing the `edgeLabels` property to the `Edge`s. There are three slots available for labels on an edge: `start`, `center`, and `end`.

There are several ways a label can appear on an edge.

## Default

This method renders simple static text on the edge. To achieve this, you need to:

- Pass the `default` type to `EdgeLabel`.
- Set the `text`.
- Optionally add the `style`, which supports any CSS property.

## HTML Template

This method renders complex HTML on the edge. To achieve this, you need to:

- Pass the `html-template` type to `EdgeLabel`.
- Provide the `<ng-template edgeLabelHtml>` inside `vflow`.
- Optionally pass any `data` that will be accessible in the template context.

### Context

You may access some data for label through `let-ctx` according to this interface.

```ts
interface EdgeLabelContext {
  // Host edge for current label
  edge: Edge;
  // Current label
  label: EdgeLabel;
}
```

## Example

{{ NgDocActions.demoPane("LabelsDemoComponent") }}
