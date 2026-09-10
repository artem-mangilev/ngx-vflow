`@vflow/ui` provides optional UI primitives for `ngx-vflow`. Applications own content,
graph state, diagnostics and business actions. Core owns geometry, interaction eligibility,
hit targets, wrapper semantics and focus. Directives style consumer HTML/SVG without wrappers.

## Setup

```typescript
import { VflowUi } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';
// Standalone component: imports: [Vflow, VflowUi]
```

Import **one** global stylesheet:

```css
@import '@vflow/ui/styles.css';
/* Or: @import '@vflow/ui/styles.source.css'; */
```

Compiled CSS needs no Tailwind. Source CSS is self-contained ordinary CSS: use your CSS
bundler's import support and optional minification (for example Tailwind 4 CLI).
Neither mode scans application templates or removes unused `.vui-*` rules.
Both come from one source and use the `vui` cascade layer. Unlayered application CSS wins.
Importing the stylesheet does not activate a global theme: put `vflowTheme="light"` or
`vflowTheme="dark"` on the editor ancestor.

## Reference compositions

- [Workflow](/design-system/workflow): cards, branches, status, diagnostics and native actions.
- [Data and media pipeline](/design-system/pipeline): typed ports, image and native controls.
- [Relationships and metrics](/design-system/relationships): container connections, notes and view-only metrics.
- [ERD and schema mapping](/design-system/entities): field rows, stable IDs and application-owned connections.
- [BPMN](/design-system/bpmn): specialized outlines, separate `@vflow/ui/bpmn` import.

## Independent editor themes

Two themed editors and one core-only flow coexist. Each supplies its own HTML/SVG templates.
The third flow deliberately has no theme scope or UI presentation. Shared markers and canvas
minimaps follow their editor, even when marker specifications are identical.

{{ NgDocActions.demo("ThemesDemoComponent", { container: false }) }}

```typescript file="./themes-demo.component.ts"

```

## Public parts

| Import / attribute                                    | Public CSS selector                                      | Purpose                                                   |
| ----------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `VflowNode` / `vflowNode`                             | `.vui-node`                                              | Surface; choose dimensions and content                    |
| `VflowNodeHeader`, `VflowNodeBody`, `VflowNodeFooter` | `.vui-node-header`, `.vui-node-body`, `.vui-node-footer` | Optional anatomy                                          |
| `VflowField` / `vflowField`                           | `.vui-field`                                             | Row; core handles anchor to its DOM box                   |
| `VflowPort`, `VflowPortLabel`                         | `.vui-port`, `.vui-port-label`                           | Visual inside core handle template; adjacent label        |
| `VflowStatus` / `vflowStatus`                         | `.vui-status`                                            | Neutral/info/success/warning/danger tone                  |
| `VflowEdge`, `VflowEdgeLabel`                         | `.vui-edge`, `.vui-edge-label`                           | SVG path and HTML label surface                           |
| `VflowGroup`, `VflowGroupHeader`                      | `.vui-group`, `.vui-group-header`                        | Container frame and title; no parent relationship implied |
| `VflowToolbar`, `VflowExternalLabel`                  | `.vui-toolbar`, `.vui-external-label`                    | Toolbar surface and external shape label                  |
| `VflowButton` / `vflowButton`                         | `.vui-button`                                            | Native button styling, not a business command             |
| `VflowControls` / `vflow-controls`                    | `.vui-toolbar`                                           | Zoom in/out and fit view; projected custom buttons        |

Titles, descriptions, icons, field metadata and actions are ordinary application HTML;
there is no directive for every element. `VflowSelected` exposes `data-vui-selected` without
changing interaction or ARIA. Bind it to core selection/preselection. `vflowPortState` exposes
`data-state="idle|valid|invalid"` from a handle template context.

`vflowStatusActive` adds activity independently of tone, selection, diagnostics and action
availability. Supply meaningful text/icons. It neither disables buttons nor creates a live
region or `aria-busy`; the application decides which announcements are useful. Reduced motion
stops animation. Status and diagnosis can be separate indicators in the same node.

```html
<vflow-controls [flow]="editor">
  <button vflowButton type="button" (click)="customAction()">My action</button>
</vflow-controls>
<vflow #editor [nodes]="nodes" [edges]="edges" />
```

Controls use only public `viewport`, `zoomRange`, `zoomTo` and `fitView`. Each receives an
explicit flow instance and clamps zoom to that instance's limits. Button labels and the group
label are inputs for localization. There is no lock/editing toggle. UI declares its core peer
dependency; BPMN directives are not in the general convenience array.

## CSS contract

| Tokens                                                      | Purpose                           |
| ----------------------------------------------------------- | --------------------------------- |
| `--vui-surface`, `--vui-surface-muted`                      | Surfaces                          |
| `--vui-foreground`, `--vui-muted`, `--vui-border`           | Text, secondary content, contours |
| `--vui-accent`, `--vui-on-accent`                           | Accent and its text               |
| `--vui-font-family`, `--vui-font-size`, `--vui-line-height` | Typography                        |
| `--vui-space`, `--vui-radius`                               | Shared rhythm and corners         |

The explicit theme scope maps these to independent core `--vflow-background`,
`--vflow-surface`, `--vflow-foreground`, `--vflow-muted`, `--vflow-border`,
`--vflow-selection`, `--vflow-focus`. Override tokens on that scope or a descendant.
For part-specific details use ordinary CSS, not component tokens:

```css
.my-editor {
  --vui-accent: #0f766e;
  --vui-radius: 6px;
}
.my-editor .vui-field {
  min-height: 30px;
}
.my-editor .vui-edge {
  stroke-width: 3px;
}
.my-editor .vui-status[data-tone='warning'] {
  color: #854d0e;
}
```

Local node overrides follow DOM inheritance; toolbar and minimap do not copy node-local
values into their separate layers. Compose custom edges with `customTemplateEdge` and
`selectable`; bind path/marker URLs and start/center/end label data through core. Use
`vflowNoDrag` and `vflowNoWheel` for embedded controls where appropriate. Keep meaningful
accessible names and do not shrink the handle hit area to shrink its visual.

Core default presentations and appearance inputs are temporarily retained until the
production acceptance matrix passes. Their major removal is not part of this interim API.
