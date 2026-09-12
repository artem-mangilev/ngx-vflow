`@vflow/ui` is an optional, directive-first design system for `ngx-vflow`.
You own the HTML/SVG structure; directives add presentation without wrapping it.
The package is developed in this workspace and will first be published with the next major release.

## Core and UI boundary

Core owns positions, hit areas, focus, keyboard behavior, wrapper semantics and interaction eligibility.
Business logic, node content and graph state belong to your application. `@vflow/ui` sits between them:
stable anatomy, states and a CSS token contract for cards, fields, ports, edges, containers and toolbars.
Specialized sets, such as BPMN, build on the same primitives and tokens.

Each page in this section shows one reference composition, its code and its limitations:

- `Workflow` — cards, branching, edge labels, native actions, independent status and diagnostics.
- `ERD and schema mapping` — field rows with ports and stable field IDs through rename and reorder.
- `BPMN` — events, gateway, task cards, lane frames and sequence links.

Data/media pipeline and relationships/metrics map pages are added together with their working examples.

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

## Anatomy and states

Directives add a public class to your own element and nothing else: no wrappers, no roles, no graph state.
Compose the parts with plain HTML and content projection; anything not listed here (descriptions, forms,
images, charts, notes, menus) is your content inside `vflowNodeBody` or a field row.

| Area       | Parts                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Shells     | `vflowNode` with `vflowNodeHeader`, `vflowNodeBody`, `vflowNodeFooter`; `vflowField`; `vflowContainer` |
| Text roles | `vflowTitle`, `vflowMeta`, `vflowIcon`, `vflowActions`, usable in any shell, label or toolbar          |
| Port       | `vflowPort` inside a handle template                                                                   |
| Edge       | `vflowEdge` on the SVG path, `vflowEdgeLabel` for HTML labels                                          |
| Extras     | `vflowStatus`, `vflowExternalLabel`, `vflowToolbar`, `vflowButton`                                     |

Three kinds of state stay separate so they can be shown at once:

- **Interaction** is owned by core: bind `vflowSelected` to `ctx.selected() || ctx.preselected()`. Focus comes from the core wrapper.
- **Diagnostics** about the model and **application status** are both your vocabulary. Each is one `vflowStatus` indicator with a tone and your text; place two side by side to show a warning next to a running status. `vflowStatusBusy` adds activity, which is presentation only and never disables anything.
- **Action availability** is the native `disabled` attribute on your buttons, driven by your rules such as read-only.

Ports mirror two independent facts: `vflowPortState` is core feedback for the connection in progress
(`idle`, `valid`, `invalid`); `vflowPortConnected` is your knowledge about existing edges.

## Directive reference

| Import                                                | Attribute                                                           | Responsibility                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `VflowTheme`                                          | `[vflowTheme]="'light'"`                                            | Scoped light/dark semantic tokens                              |
| `VflowSelected`                                       | `[vflowSelected]="ctx.selected() \|\| ctx.preselected()"`           | Selection presentation; no interaction or ARIA changes         |
| `VflowNode`                                           | `vflowNode`                                                         | Node surface; consumer chooses size and content                |
| `VflowNodeHeader`, `VflowNodeBody`, `VflowNodeFooter` | `vflowNodeHeader`, `vflowNodeBody`, `vflowNodeFooter`               | Optional anatomy on consumer elements                          |
| `VflowField`                                          | `vflowField`                                                        | Field row with room for text roles and core handles            |
| `VflowContainer`                                      | `vflowContainer`                                                    | Frame; parent relationships remain explicit in graph data      |
| `VflowTitle`, `VflowMeta`                             | `vflowTitle`, `vflowMeta`                                           | Primary wrapping text and secondary text in any shell          |
| `VflowIcon`, `VflowActions`                           | `vflowIcon`, `vflowActions`                                         | Icon slot and a group of controls; add `vflowNoDrag` to each   |
| `VflowPort`                                           | `vflowPort [vflowPortState]="ctx.state()" [vflowPortConnected]="…"` | Visual inside a handle template: idle/valid/invalid, connected |
| `VflowStatus`                                         | `[vflowStatus]="'warning'" [vflowStatusBusy]="true"`                | Indicator: semantic tone, your text and optional activity      |
| `VflowEdge`                                           | `vflowEdge` on an SVG path                                          | Stroke; bind core path and marker URLs yourself                |
| `VflowEdgeLabel`                                      | `vflowEdgeLabel`                                                    | HTML label surface, including optional native controls         |
| `VflowToolbar`                                        | `vflowToolbar`                                                      | Surface for `node-toolbar` content                             |
| `VflowExternalLabel`                                  | `vflowExternalLabel`                                                | Label below a positioned shape                                 |
| `VflowBpmnEvent`                                      | `[vflowBpmnEvent]="'start'"`                                        | Start/intermediate/end event outlines                          |
| `VflowBpmnGateway`                                    | `vflowBpmnGateway`                                                  | Diamond outline; supply the gateway symbol                     |
| `VflowButton`                                         | `vflowButton` on a native button                                    | Button presentation with focus and disabled states             |

Each directive is independently importable. None imports ngx-vflow, owns graph state,
adds wrapper elements, registers ports or changes accessibility roles. Public selectors are the
`.vui-*` classes named after the attributes, for example `.vui-title` or `.vui-status[data-tone='warning']`;
context rules such as `.vui-container > .vui-title` style a role inside a shell.

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

The token set above is the current MVP contract. The public set will be reduced to shared semantic
tokens; part details such as field height or port size will become ordinary CSS on public selectors.

Compose custom edges with `customTemplateEdge` and `selectable`, and use core gesture
exclusions such as `vflowNoDrag` for embedded controls. Do not shrink a hit area just to make
its visual smaller. Keep status text alongside color and give icon-only buttons accessible names.

This release adds opt-in presentations. Existing core default types remain available;
their removal/migration is a separate major-release step. Canvas minimap presentation is
also outside this MVP: it needs resolved colors through core presentation hooks, not CSS
variables passed directly to canvas drawing APIs.
