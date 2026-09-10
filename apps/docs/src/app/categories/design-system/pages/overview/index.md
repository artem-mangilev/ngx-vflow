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
Neither mode scans application templates or removes unused rules. Both come from one source
and use the `vui` cascade layer. Importing CSS does not activate a global theme: put
`vflowTheme="light"` or `vflowTheme="dark"` on the editor ancestor.

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

## Composition API

Use `VflowNode`, `VflowNodeHeader`, `VflowNodeBody`, `VflowNodeFooter` for cards;
`VflowField`, `VflowPort`, `VflowPortLabel` for rows and ports;
`VflowGroup`, `VflowGroupHeader` for container frames;
`VflowEdge`, `VflowEdgeLabel` for SVG paths and HTML labels;
`VflowToolbar`, `VflowExternalLabel`, `VflowButton` for surrounding UI.
The directives are the composition API; the classes they attach are implementation details,
not a public styling contract.

Titles, descriptions, icons, field metadata and actions are ordinary application HTML.
`VflowSelected` binds core selection/preselection without changing interaction or ARIA.
`vflowPortState` accepts `idle|valid|invalid` from a handle template context.

`VflowStatus` supplies neutral/info/success/warning/danger tones. `vflowStatusActive` adds
activity independently of tone, selection, diagnostics and action availability. Supply
meaningful text/icons. It neither disables buttons nor creates a live region or `aria-busy`;
the application decides which announcements are useful. Reduced motion stops animation.
Status and diagnosis can be separate indicators in the same node.

```html
<vflow-controls [flow]="editor">
  <button vflowButton type="button" (click)="customAction()">My action</button>
</vflow-controls>
<vflow #editor [nodes]="nodes" [edges]="edges" />
```

Controls use only public `viewport`, `zoomRange`, `zoomTo` and `fitView`. Each receives an
explicit flow instance and clamps zoom to that instance's limits. Button labels and the group
label are inputs for localization. There is no locking/editing toggle. UI declares its core
peer dependency; BPMN directives are not in the general convenience array.

## CSS custom-property contract

Both shared semantic values and part-specific details use **CSS custom properties**, not
public classes or programmatic appearance inputs. See the complete [part variables and
migration guide](/design-system/styling).

| Shared UI tokens                                            | Purpose             |
| ----------------------------------------------------------- | ------------------- |
| `--vui-surface`, `--vui-surface-muted`                      | Surfaces            |
| `--vui-foreground`, `--vui-muted`, `--vui-border`           | Text and contours   |
| `--vui-accent`, `--vui-on-accent`                           | Accent and its text |
| `--vui-font-family`, `--vui-font-size`, `--vui-line-height` | Typography          |
| `--vui-space`, `--vui-radius`                               | Rhythm and corners  |

The explicit UI theme scope maps these to independent core `--vflow-background`,
`--vflow-surface`, `--vflow-foreground`, `--vflow-muted`, `--vflow-border`,
`--vflow-selection`, `--vflow-focus`. Core works without UI CSS.

```css
.my-editor {
  --vui-accent: #0f766e;
  --vui-field-min-height: 30px;
  --vui-edge-width: 3px;
  --vui-status-warning-color: #854d0e;
  --vflow-resize-handle-radius: 50%;
  --vflow-alignment-guide-width: 2;
  --vflow-selection-box-fill-opacity: 0.2;
}
```

Apply variables on your editor/theme element, an ancestor, or your own template element.
Part variables fall back to shared tokens at the usage site, so inherited overrides are not
shadowed by defaults on internal hosts. Variables cross Angular view encapsulation through
normal CSS inheritance; you do not need `::ng-deep` or `!important`.

Core resize controls, shared marker definitions, toolbar and minimap do not inherit
variables from a nested card in another DOM branch; put their variables on the editor.
UI parts inside a card inherit its local variables normally. For individually styled markers or label anatomy, supply
application-owned SVG/HTML. Application-owned classes remain yours to style normally.

Compose custom edges with `customTemplateEdge` and `selectable`; bind path/marker URLs and
start/center/end label data through core. Use `vflowNoDrag` and `vflowNoWheel` for embedded
controls. Keep meaningful accessible names and do not shrink hit areas to shrink visuals.

Default core presentations remain until their separate production acceptance gate passes.
Appearance inputs have been removed independently; follow the migration guide rather than
retaining accepted-but-ignored styling fields.
