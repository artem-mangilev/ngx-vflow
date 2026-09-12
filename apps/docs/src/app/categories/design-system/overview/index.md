`@vflow/ui` is an optional, directive-first design system for `ngx-vflow`.
You own the HTML/SVG structure; directives add presentation without wrapping it.
The package is developed in this workspace and will first be published with the next major release.

## Core and UI boundary

Core owns positions, hit areas, focus, keyboard behavior, wrapper semantics and interaction eligibility.
Business logic, node content and graph state belong to your application. `@vflow/ui` sits between them:
stable anatomy, states and a CSS token contract for cards, fields, ports, edges, containers and toolbars.
Specialized sets, such as BPMN, build on the same primitives and tokens.

Each page in this section shows one reference composition, its code and its limitations:

- `Workflow` — cards, branching, edge labels, native actions, independent status and diagnostics, viewport controls.
- `Data and media pipeline` — typed labeled ports, rich body content, native controls inside nodes.
- `ERD and schema mapping` — field rows with ports, stable field IDs through rename, reorder and deletion, a scroll/collapse experiment.
- `Relationships and metrics map` — containers with their own connections, a note without ports, metrics and images, view mode.
- `BPMN` — pools with message flows, lanes, tasks, events, gateways and flow kinds from the `@vflow/ui/bpmn` entry.

## Setup

Import individual directives or the `VflowUi` convenience array alongside `Vflow`:

```typescript
import { VflowUi } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

// In your standalone component:
// imports: [Vflow, VflowUi]
```

Then add one of the two stylesheet entries to your application:

| Entry                         | Use when                                                                                       | How                                                                                                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vflow/ui/styles.css`        | Default. Compiled and minified; no Tailwind or source scanning on your side.                   | Add it to the `styles` of your build, or `@import '@vflow/ui/styles.css';` in a global stylesheet.                                                                                                                                           |
| `@vflow/ui/styles.source.css` | You run Tailwind v4 and want this CSS processed by your own pipeline (minification, bundling). | Create a separate global stylesheet containing only `@import '@vflow/ui/styles.source.css';` and let Tailwind process it. The file registers the package code with `@source`, so the utilities of the directives are generated on your side. |

The source entry uses the `vui` prefix, so it has to be compiled as its own stylesheet, not inside the
`@import 'tailwindcss'` of your application. Both entries produce the same rules; import only one.
UI rules live in Tailwind cascade layers, so unlayered application CSS overrides them without `!important`.

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

### Edges

`vflowEdge` styles the visible SVG path of a `customTemplateEdge`; routing, hit targets and markers stay in core,
so attach `markers` in edge data and bind `ctx.markerEnd()`. Labels at `start`, `center` and `end` positions
come from core `edgeLabels`; `vflowEdgeLabel` is their surface and can hold `vflowActions` with native buttons.

### Viewport controls

`<vflow-controls [flow]="flow">` renders zoom in, zoom out and fit view for the given `VflowComponent`
instance, clamped to its `minZoom`/`maxZoom`, and projects your own `<button vflowControlButton>` elements.
Position the element yourself, above the flow pane. Editing toggles, form controls and business actions are
not part of the library; `@vflow/ui` declares `ngx-vflow` as a peer dependency for this component.

### BPMN entry point

`import { VflowBpmn } from '@vflow/ui/bpmn'` adds the agreed subset on top of the shared parts: task,
start/intermediate/end events, exclusive and parallel gateways, pool and lane frames with a vertical
`vflowTitle`, and `vflowBpmnFlow` for sequence, message and association paths. Pools and lanes are
`template-group` nodes; their parent relationships stay in graph data, and a pool can carry its own handles
for message flows. Execution semantics, BPMN XML and model validation belong to the application.

## Directive reference

| Import                                                   | Attribute                                                           | Responsibility                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `VflowTheme`                                             | `[vflowTheme]="'light'"`                                            | Scoped light/dark semantic tokens                              |
| `VflowSelected`                                          | `[vflowSelected]="ctx.selected() \|\| ctx.preselected()"`           | Selection presentation; no interaction or ARIA changes         |
| `VflowNode`                                              | `vflowNode`                                                         | Node surface; consumer chooses size and content                |
| `VflowNodeHeader`, `VflowNodeBody`, `VflowNodeFooter`    | `vflowNodeHeader`, `vflowNodeBody`, `vflowNodeFooter`               | Optional anatomy on consumer elements                          |
| `VflowField`                                             | `vflowField`                                                        | Field row with room for text roles and core handles            |
| `VflowContainer`                                         | `vflowContainer`                                                    | Frame; parent relationships remain explicit in graph data      |
| `VflowTitle`, `VflowMeta`                                | `vflowTitle`, `vflowMeta`                                           | Primary wrapping text and secondary text in any shell          |
| `VflowIcon`, `VflowActions`                              | `vflowIcon`, `vflowActions`                                         | Icon slot and a group of controls; add `vflowNoDrag` to each   |
| `VflowPort`                                              | `vflowPort [vflowPortState]="ctx.state()" [vflowPortConnected]="…"` | Visual inside a handle template: idle/valid/invalid, connected |
| `VflowStatus`                                            | `[vflowStatus]="'warning'" [vflowStatusBusy]="true"`                | Indicator: semantic tone, your text and optional activity      |
| `VflowEdge`                                              | `vflowEdge` on an SVG path                                          | Stroke; bind core path and marker URLs yourself                |
| `VflowEdgeLabel`                                         | `vflowEdgeLabel`                                                    | HTML label surface, including optional native controls         |
| `VflowToolbar`                                           | `vflowToolbar`                                                      | Surface for `node-toolbar` content                             |
| `VflowExternalLabel`                                     | `vflowExternalLabel`                                                | Label below a positioned shape                                 |
| `VflowControls`, `VflowControlButton`                    | `<vflow-controls [flow]="flow">`, `button[vflowControlButton]`      | Viewport controls for one flow instance and custom buttons     |
| `VflowBpmnEvent` (bpmn)                                  | `[vflowBpmnEvent]="'start'"`                                        | Start/intermediate/end event outlines                          |
| `VflowBpmnGateway` (bpmn)                                | `[vflowBpmnGateway]="'exclusive'"`                                  | Diamond with × or + marker; text goes in `vflowExternalLabel`  |
| `VflowBpmnTask`, `VflowBpmnPool`, `VflowBpmnLane` (bpmn) | `vflowBpmnTask`, `vflowBpmnPool`, `vflowBpmnLane`                   | Task card, participant frame and lane frame                    |
| `VflowBpmnFlow` (bpmn)                                   | `[vflowBpmnFlow]="'message'"` on an SVG path                        | Sequence, message or association line style                    |
| `VflowButton`                                            | `vflowButton` on a native button                                    | Button presentation with focus and disabled states             |

Each directive is independently importable. Apart from `vflow-controls`, none imports ngx-vflow; none owns
graph state, adds wrapper elements, registers ports or changes accessibility roles. Public selectors are the
`.vui-*` classes named after the attributes, for example `.vui-title` or `.vui-status[data-tone='warning']`;
context rules such as `.vui-container > .vui-title` style a role inside a shell.

## Themes and composition

Put `vflowTheme` on an ancestor of the whole flow so nodes, SVG edges, markers, labels, toolbars and
the minimap share its tokens. Different editors can have different themes on the same page, and a flow
outside every theme scope keeps the core defaults: importing the stylesheet never themes a flow by itself.

{{ NgDocActions.demo("ThemesDemoComponent", { container: false }) }}

Shared values are the public tokens below. Everything else, such as card padding, row height, port size or
line width, is ordinary CSS on the public `.vui-*` selectors; the density of all parts follows `--vui-space`.

```css
.my-editor {
  --vui-accent: #0f766e;
  --vui-on-accent: white;
  --vui-radius: 6px;
  --vui-space: 3px;
}
.my-editor .vui-port {
  width: 10px;
  height: 10px;
}
```

| Tokens                                                      | Purpose                           |
| ----------------------------------------------------------- | --------------------------------- |
| `--vui-surface`, `--vui-surface-muted`                      | Card and header backgrounds       |
| `--vui-foreground`, `--vui-muted`, `--vui-border`           | Text, secondary text and borders  |
| `--vui-accent`, `--vui-on-accent`                           | Actions, selection and their text |
| `--vui-font-family`, `--vui-font-size`, `--vui-line-height` | Typography                        |
| `--vui-space`, `--vui-radius`                               | Spacing unit and corner radius    |

Core has its own tokens with defaults for standalone use: `--vflow-background`, `--vflow-surface`,
`--vflow-foreground`, `--vflow-muted`, `--vflow-border`, `--vflow-selection` and `--vflow-focus`.
A theme scope maps the UI tokens onto them; set a `--vflow-*` token on the flow element or any
descendant to override both. The canvas minimap samples the resolved tokens and repaints when an
attribute changes on any ancestor of the flow (for example `data-vui-theme` or a class) or when the
`prefers-color-scheme` preference changes; edits to a stylesheet alone are not observed.

Compose custom edges with `customTemplateEdge` and `selectable`, and use core gesture
exclusions such as `vflowNoDrag` for embedded controls. Do not shrink a hit area just to make
its visual smaller. Keep status text alongside color and give icon-only buttons accessible names.

Core is headless: it ships no ready-made node, group, edge or label presentation and no appearance
inputs. Supply templates yourself or use these parts; see the migration guide in the Introduction section.
