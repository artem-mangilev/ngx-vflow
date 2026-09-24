You can create markers for both edges and connections.

- **Edges**: Specify `start` and `end` markers for corresponding parts of the edge. The built-in markers are two
  `type`s: `arrow` and `arrow-closed`. `width`, `height`, `orient` and `strokeWidth` are optional. Any other shape
  is a custom marker, see below.
- **Connections**: You can specify an end marker using the `marker` property in `ConnectionSettings`.

A marker is an object with a `type` and optional size, or the type alone: `markers: { end: 'arrow' }`. Markers
take the stroke color of the edge that references them (`context-stroke`), so a themed or selected edge colors its
arrowheads automatically, and their stroke is `strokeWidth` flow units wide at any size, `2` by default: an edge
drawn thicker sets the same `strokeWidth` on its markers. Bind `ctx.markerStart()` / `ctx.markerEnd()` in your
edge template.

The arrow tip touches the connection point of the handle. The path itself ends earlier, so the square end of the
line stays hidden: under a closed arrowhead it ends at the base of the arrow, which covers a line up to half the
marker width; through an open arrow it runs to just short of the tip. `sourcePoint` and `targetPoint` that a custom
curve receives are already moved by that distance when the edge has a marker on that end.

{{ NgDocActions.demoPane("MarkersDemoComponent") }}

## Custom markers

The built-in types are shapes the library ships; any other `type` is a shape you declare with `ng-template[marker]`.
The flow renders one `<marker>` element per distinct marker for both, with the `width`, `height`, `orient` and
`strokeWidth` the marker asks for and the stroke of the edge, so a declared shape is used exactly like an arrow:
as the type alone, or as an object with a size. The connection line accepts it in `marker` as well.

{% raw %}

```html
<vflow [nodes]="nodes" [edges]="edges">
  <ng-template marker="diamond" inset="8">
    <svg:polygon fill="context-stroke" points="-1,0 -5,-4 -9,0 -5,4" />
  </ng-template>
</vflow>
```

```ts
edges = createEdges([{ id: '1 -> 2', source: '1', target: '2', markers: { start: 'bar', end: { type: 'diamond', width: 24 } } }]);
```

{% endraw %}

The shape draws in the viewBox `-10 -10 20 20` with its tip vertex at `x = -1`, so that its stroke ends at `0`,
the point that touches the handle, and its body towards negative `x`. `inset` is where the path ends, in marker
units before that point. Put it one unit inside the back vertex of the shape, under its stroke: the diamond above
reaches `x = -9`, so its inset is `8`. The line then neither leaves a gap at the back nor runs through an open
circle or diamond; for a bar the inset is on the bar. Set `fill="none"` or `fill="context-stroke"` on the shape
yourself. Stroke properties inherit from the marker element. The stroke is `strokeWidth` flow units wide at any
marker size, `2` by default like the default edge line, so a line meets its marker without a step; give a marker
of a thicker edge the same `strokeWidth`. Your CSS can still override the stroke through the `vflow-marker` and
`vflow-marker--<type>` classes, in marker units. A type without a declared shape renders an empty marker, and
development mode warns about it.

{{ NgDocActions.demoPane("CustomMarkersDemoComponent") }}
