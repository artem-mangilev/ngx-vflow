# @vflow/ui

Optional UI primitives for ngx-vflow, requiring Angular 20 or 21 and ngx-vflow.
Applications own content, graph state and actions. Core owns geometry, interaction and accessibility wrappers.
The package is developed in this workspace; its first publication is planned for the next ngx-vflow major release.

```typescript
import { VflowUi } from '@vflow/ui';
import { VflowBpmn } from '@vflow/ui/bpmn'; // optional specialized subset
import { Vflow } from 'ngx-vflow';
// Component imports: [Vflow, VflowUi, VflowBpmn]
```

Choose **one** global CSS import:

```css
@import '@vflow/ui/styles.css';
/* Or @import '@vflow/ui/styles.source.css'; */
```

Compiled CSS works without Tailwind. Source CSS is self-contained ordinary CSS for your
bundler/import processor and optional minifier; it requires no source scanning or Tailwind.
Neither mode promises removal of unused rules. Both are generated from one source, in the
`vui` cascade layer. Unlayered application rules override the library.

```html
<section vflowTheme="light">
  <article vflowNode>
    <header vflowNodeHeader>Review invoice</header>
    <div vflowNodeBody>Your content</div>
    <footer vflowNodeFooter>
      <span vflowStatus="info" [vflowStatusActive]="true">Checking invoice</span>
      <span vflowStatus="danger">Missing purchase order</span>
      <button vflowButton type="button">Approve</button>
    </footer>
  </article>
</section>
```

The theme is explicit, never installed on `:root`. Override shared tokens:
`--vui-surface`, `--vui-surface-muted`, `--vui-foreground`, `--vui-muted`, `--vui-border`,
`--vui-accent`, `--vui-on-accent`, `--vui-font-family`, `--vui-font-size`,
`--vui-line-height`, `--vui-space`, `--vui-radius`.
Part-specific adjustments also use variables, for example `--vui-field-min-height: 30px`,
`--vui-edge-width: 3px`, `--vui-node-body-padding: 20px`. Classes added by directives are
implementation details, not a public styling API.

Compose cards, fields, port visuals/labels, status indicators, container frames/headers,
toolbar surfaces, external labels and SVG edge paths on consumer elements. Bind `vflowSelected`
to core selection/preselection and `vflowPortState` inside a core handle template. Status tone,
activity, diagnostics and action availability remain independent. UI never changes wrapper roles.

`<vflow-controls [flow]="editor">` provides zoom in/out and fit view using the explicit
`VflowComponent` reference; project custom buttons inside. Zoom is clamped to `editor.zoomRange()`.
There is no editing lock. Labels are localizable inputs.

BPMN is separate: `VflowBpmnTask`, `VflowBpmnEvent` (start/end), `VflowBpmnGateway` (XOR/parallel),
`VflowBpmnPool`, `VflowBpmnLane`, `VflowBpmnLink` (sequence/message/association).
Consumers provide symbols, anchors, core path/marker bindings and process semantics.

See the **Design system** documentation section for five reference compositions, the part-variable catalogue and migration guide,
theme examples and limitations. The Entities composition demonstrates application-owned scroll/collapse docking for small field sets: persistent ports stay outside hidden/clipped content and request updated core geometry after CSS placement. This is not an automatic UI or core policy for arbitrary lists.
Minimap follows editor tokens, not node-local overrides; ancestor attribute changes refresh
its resolved canvas colors, while external stylesheet/media changes require `refreshTheme()`.

Core appearance inputs have been removed in favor of CSS variables. Default presentations
remain until their separate acceptance gate passes. Versions/releases follow the shared ngx-vflow release process (`docs/releasing.md`).
