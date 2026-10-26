A small image editor. Pictures flow along the edges: every node shows a preview of its output, so rewiring,
moving a slider or picking another picture updates everything downstream. Previews are plain CSS (`filter` and
`mix-blend-mode`); only Download draws the same operations on a canvas.

Drag from an output to an input of the same type: images connect to images, numbers to an amount. A new edge into an
input replaces the old one. Add nodes from the palette, select a node or an edge and press Delete to remove it.
Play the Number node to drive the hue with a wave.

{{ NgDocActions.demo("PipelineDemoComponent", { container: false }) }}

```typescript file="./pipeline-demo.component.ts"

```

```typescript file="./image-lab.ts"

```

```typescript file="./picture.component.ts"

```

## What this page proves

- Typed, labeled ports without a dedicated port-label part: a `vuiRow` with `vuiTitle` and `vuiMeta` next to the core handle, colored by type through application CSS on the public `.vui-port` selector. A port row can hold a control: the amount slider, which a connected number replaces with the name of its source.
- Rich body content: images, selects, ranges and buttons. `vNoDrag` keeps them from moving the node and `vNoWheel` lets a range own the wheel.
- Type compatibility, cycles and one edge per input belong to the application: the validator compares port types and rejects an edge that would close a loop, `connect` replaces the edge into the same input.
- The graph is the program: the application evaluates its own data along the edges, the library only draws and edits the graph.
