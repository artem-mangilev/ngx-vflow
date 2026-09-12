Four stages of a media pipeline. Ports are typed and labeled field rows: inputs on the left, outputs on the
right, colored by type through application CSS on the public `.vui-port` selector. Bodies hold a clip
preview, native form controls and a small chart; all of it is consumer content.

{{ NgDocActions.demo("PipelineDemoComponent", { container: false }) }}

```typescript file="./pipeline-demo.component.ts"

```

## What this page proves

- Typed, labeled ports without a dedicated port-label part: a `vflowField` row with `vflowTitle` and `vflowMeta` next to the core handle.
- Rich body content: an inline image, a select, a range and a checkbox. `vflowNoDrag` keeps them from moving the node and `vflowNoWheel` lets the range own the wheel.
- Geometry follows content: enabling the poster output inserts a row above the video output, and the existing edge stays on its port.
- Type compatibility and the wiring belong to the application: the validator compares port types, `connect` adds the edge.
