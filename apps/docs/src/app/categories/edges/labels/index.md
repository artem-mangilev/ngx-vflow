---
keyword: 'FeaturesEdgeLabels'
---

A label is HTML that follows an edge. Declare it inside the edge presentation with the `edgeLabel` structural
directive: the flow renders it in its label layer at the `start`, `center` or `end` point of the path and moves it
together with the edge.

{% raw %}

```html
<ng-template let-ctx edge>
  <svg:g edgeInteraction>
    <svg:path vflowEdge [attr.d]="ctx.path()" />
  </svg:g>

  <span *edgeLabel vflowEdgeLabel>{{ ctx.data().label }}</span>
  <button *edgeLabel="'end'" (click)="remove(ctx.edge)">×</button>
</ng-template>
```

{% endraw %}

- Without a value the label sits at the center. A value of `start` or `end` picks another point, as the button
  above shows; the value is an expression, so the quotes are required.
- For several root elements use the long form on an `ng-template` with the `edgeLabel` attribute.
- A label has no template context of its own. It reads the edge context or the state of the component that declares
  it, so label text belongs to the edge `data`.
- An edge component declares labels in its own template the same way and reads its edge through `injectEdge()`.
- A position holds one label. A second label at the same position replaces the first, and development mode warns.

Declare labels next to the SVG elements of the edge, never inside `svg:g` or another `svg:*` element. Angular compiles
HTML inside SVG in the SVG namespace, such a label does not render, and development mode warns about it.

Built-in curves provide the label points. A custom curve returns them as `labelPoints`; without them labels do not
render.

## Example

{{ NgDocActions.demoPane("LabelsDemoComponent") }}
