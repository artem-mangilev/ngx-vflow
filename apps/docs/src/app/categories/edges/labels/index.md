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

## Orientation

A label is horizontal by default. `orient: 'path'` turns it along the path at its point, as the center label of the
lower edge in the demo shows:

{% raw %}

```html
<span *edgeLabel="'center'; orient: 'path'" vflowEdgeLabel>{{ ctx.data().label }}</span> <ng-template edgeLabel="end" edgeLabelOrient="path">…</ng-template>
```

{% endraw %}

The label turns around its own center by the direction of the path there and stays readable: on an edge drawn
right to left or upwards it turns back, so the text never reads upside down. On a step curve the label lies along
its segment; on a straight or bezier curve it follows the tangent.

Built-in curves provide the label points and their directions. A custom curve returns them as `labelPoints`; without
them labels do not render, and a point without `angle` renders its label horizontally whatever its `orient`.

## Example

{{ NgDocActions.demoPane("LabelsDemoComponent") }}
