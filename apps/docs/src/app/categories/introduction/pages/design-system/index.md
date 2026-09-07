`@vflow/ui` is an optional, directive-first design system for `ngx-vflow`.
You own the HTML/SVG structure; directives add presentation without wrapping it.
The package is developed in this workspace and will first be published with the next major release.

## Setup

Import individual directives or the `VflowUi` convenience array alongside `Vflow`:

```typescript
import { VflowUi } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

// In your standalone component:
// imports: [Vflow, VflowUi]
```

Include `@vflow/ui/styles.css` in your application's global styles. It is precompiled;
consumers need neither Tailwind nor source scanning. The build retains prefixed Tailwind 4
utilities without Preflight. UI styles live in the `vui` cascade layer; unlayered application
CSS can override them. If your application uses layers, declare your override layer after `vui`.

## Approval workflow

Cards, headers, footers, status badges, edge labels and a node toolbar all use consumer DOM.
Approve is an ordinary native button; read-only disables editing while preserving navigation.
This recipe displays application state and does not execute a workflow.

{{ NgDocActions.demo("WorkflowDemoComponent", { container: false }) }}

```typescript file="./workflow-demo.component.ts"

```

## Entities and field mapping

The same `vflowField` structure serves both Customer/Order relationships and CRM/ERP mapping.
Handles use stable field IDs, so renaming a field and reversing rows preserve endpoints.
Input and output IDs are distinct (`in:field-id` and `out:field-id`) and independent of visible names.
Drag between ports of matching types to add a connection; remove it using its label button.
Type compatibility and graph changes belong to this application, not to the UI directive.

{{ NgDocActions.demo("EntitiesDemoComponent", { container: false }) }}

```typescript file="./entities-demo.component.ts"

```

Rows remain mounted: this MVP does not implement internal scrolling, collapsing or virtualized
field lists. Those features need an explicit policy for connections to hidden fields.
The `1 → N` label illustrates cardinality; it is not SQL schema validation or a crow's-foot marker.

## BPMN presentation

Start, intermediate and end outlines, an exclusive gateway, task cards and two lane frames.
The gateway rotates only its decorative outline, leaving the text and port anchors unrotated.
Symbols and names are supplied by the consumer. These are visual primitives, not a BPMN
modeler: XML import/export, modeling rules, boundary events and execution are outside this MVP.

{{ NgDocActions.demo("BpmnDemoComponent", { container: false }) }}

```typescript file="./bpmn-demo.component.ts"

```

## Directive reference

| Import                                                | Attribute                                             | Responsibility                                                   |
| ----------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| `VflowTheme`                                          | `[vflowTheme]="'light'"`                              | Scoped light/dark semantic tokens                                |
| `VflowSelected`                                       | `[vflowSelected]="ctx.selected()                      |                                                                  | ctx.preselected()"` | Selection presentation; no interaction or ARIA changes |
| `VflowNode`                                           | `vflowNode`                                           | Node surface; consumer chooses size and content                  |
| `VflowNodeHeader`, `VflowNodeBody`, `VflowNodeFooter` | `vflowNodeHeader`, `vflowNodeBody`, `vflowNodeFooter` | Optional anatomy on consumer elements                            |
| `VflowField`                                          | `vflowField`                                          | Field row with room for names, metadata and core handles         |
| `VflowPort`                                           | `vflowPort [vflowPortState]="ctx.state()"`            | Visual inside a handle template: idle/valid/invalid              |
| `VflowStatus`                                         | `[vflowStatus]="'warning'"`                           | Neutral/info/success/warning/danger tone; supply meaningful text |
| `VflowEdge`                                           | `vflowEdge` on an SVG path                            | Stroke; bind core path and marker URLs yourself                  |
| `VflowEdgeLabel`                                      | `vflowEdgeLabel`                                      | HTML label surface, including optional native controls           |
| `VflowGroup`                                          | `vflowGroup`                                          | Frame; parent relationships remain explicit in graph data        |
| `VflowBpmnEvent`                                      | `[vflowBpmnEvent]="'start'"`                          | Start/intermediate/end event outlines                            |
| `VflowBpmnGateway`                                    | `vflowBpmnGateway`                                    | Diamond outline; supply the gateway symbol                       |
| `VflowButton`                                         | `vflowButton` on a native button                      | Button presentation with focus and disabled states               |

Each directive is independently importable. None imports ngx-vflow, owns graph state,
adds wrapper elements, registers ports or changes accessibility roles.

## Themes and composition

Put `vflowTheme` on an ancestor of the whole flow so nodes, SVG edges, markers, labels and
toolbars share its tokens. Different editors can have different themes on the same page.
Per-node overrides do not automatically propagate to toolbar content mounted in another layer.

```css
.my-editor {
  --vui-accent: #0f766e;
  --vui-on-accent: white;
  --vui-radius: 6px;
  --vui-field-height: 30px;
}
```

| Tokens                                                                   | Purpose                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `--vui-canvas`, `--vui-surface`, `--vui-surface-muted`                   | Backgrounds; explicitly pass the canvas token to core `background` |
| `--vui-foreground`, `--vui-muted`, `--vui-border`                        | Text, secondary text and borders                                   |
| `--vui-accent`, `--vui-on-accent`                                        | Actions and their text                                             |
| `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info`           | Status and port validation colors                                  |
| `--vui-radius`, `--vui-padding`, `--vui-font-size`, `--vui-field-height` | Node anatomy and density                                           |
| `--vui-port-size`, `--vui-edge-width`                                    | Visible port size and line width                                   |
| `--vui-selection`, `--vui-focus`, `--vui-port-color`, `--vui-edge-color` | Optional local overrides; fall back to semantic tokens             |

Core still owns positions, hit areas, focus, keyboard behavior and interaction eligibility.
Compose custom edges with `customTemplateEdge` and `selectable`, and use core gesture
exclusions such as `vflowNoDrag` for embedded controls. Do not shrink a hit area just to make
its visual smaller. Keep status text alongside color and give icon-only buttons accessible names.

This release adds opt-in presentations. Existing core default types remain available;
their removal/migration is a separate major-release step. Canvas minimap presentation is
also outside this MVP: it needs resolved colors through core presentation hooks, not CSS
variables passed directly to canvas drawing APIs.
