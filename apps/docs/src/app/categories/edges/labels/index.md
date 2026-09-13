You can attach labels to edges by providing the `edgeLabels` property to the `Edge`s. There are three slots available for labels on an edge: `start`, `center`, and `end`.

A label is rendered by your `<ng-template edgeLabelHtml>` inside `vflow`; core positions it on the path. To add one:

- Pass the `html-template` type to `EdgeLabel`.
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
