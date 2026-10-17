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

Import individual directives or the `Vui` convenience array alongside `Vflow`:

```typescript
import { Vui } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

// In your standalone component:
// imports: [Vflow, Vui]
```

Then add one of the two stylesheet entries to your application:

| Entry                         | Use when                                                                                       | How                                                                                                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vflow/ui/styles.css`        | Default. Compiled and minified; no Tailwind or source scanning on your side.                   | Add it to the `styles` of your build, or `@import '@vflow/ui/styles.css';` in a global stylesheet.                                                                                                                                           |
| `@vflow/ui/styles.source.css` | You run Tailwind v4 and want this CSS processed by your own pipeline (minification, bundling). | Create a separate global stylesheet containing only `@import '@vflow/ui/styles.source.css';` and let Tailwind process it. The file registers the package code with `@source`, so the utilities of the directives are generated on your side. |

The source entry brings its own `vui` theme and utilities layer, so compile it as its own stylesheet, not inside
the `@import 'tailwindcss'` of your application. Both entries produce the same rules; import only one.
UI rules live in Tailwind cascade layers, so unlayered application CSS overrides them without `!important`.

## Anatomy and states

Directives add a public class to your own element and nothing else: no wrappers, no roles, no graph state.
Compose the parts with plain HTML and content projection; anything not listed here (descriptions, forms,
images, charts, notes, menus) is your content inside `vuiNodeBody` or a field row.

| Area       | Parts                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Shells     | `vuiNode` with `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`; `vuiField`; `vuiContainer`            |
| Text roles | `vuiTitle`, `vuiMeta`, `vuiIcon`, `vuiActions`, usable in any shell, label or toolbar                 |
| Port       | `vuiPort` with `handleType`, `position` and the other handle inputs: a core handle with the port look |
| Edge       | `vuiEdge` on the SVG path, `vuiEdgeLabel` for HTML labels                                             |
| Extras     | `vuiStatus`, `vuiExternalLabel`, `vuiToolbar`, `vuiButton`                                            |

The node shell's resting shadow has no blur (`0 1px 0`). A blurred shadow is rasterized again for every visible node on every zoom step and pan, which on a large flow at a high device pixel ratio costs more GPU time than the rest of the node; see the measurement on the Virtualization page. Blurred shadows and translucent material are reserved for floating layers: toolbars and viewport controls.

Three kinds of state stay separate so they can be shown at once:

- **Interaction** is owned by core: bind `vuiSelected` to `ctx.selected() || ctx.preselected()`. Focus comes from the core wrapper.
- **Diagnostics** about the model and **application status** are both your vocabulary. Each is one `vuiStatus` indicator with a tone and your text; place two side by side to show a warning next to a running status. `vuiStatusBusy` adds a pulsing dot, which is presentation only and never disables anything; the text must name the activity ("Running", "Syncing"), and an indicator that changes while the user works belongs in a `role="status"` region of yours so screen readers hear it.
- **Action availability** is the native `disabled` attribute on your buttons, driven by your rules such as read-only.

Ports mirror two independent facts: the core feedback for the connection in progress (`idle`, `valid`, `invalid`),
read from the core handle that `vuiPort` applies to the same element (`vuiPortState` only overrides it); `vuiPortConnected` is your
knowledge about existing edges. An idle port is a 12px ring, filled once connected; an invalid target is a dashed red ring,
so the state does not depend on color alone. A pseudo-element widens the pointer target to 28px along the node side and
8px into the node, never outward, where the end of a connected edge takes reconnection presses; the endpoint does not move. `vuiPortReveal="interaction"` keeps idle ports without edges invisible until their node is hovered,
focused or selected, which suits notations such as BPMN that draw no connection points. While a connection is drawn,
the ports of a node appear when the pointer reaches it; ports of other nodes stay hidden but remain targets. Hover does
not follow a finger, so keep the default `always` where users connect by touch.

### Buttons

`vuiButton` takes a variant: `primary` (the default) for the one main action of an area, `secondary` for other
actions, and `plain` for actions in rows, labels, toolbars and viewport controls. `vuiButtonSize="sm"` is 24px, the
smallest target WCAG 2.2 accepts without spacing; `vuiButtonIcon` makes the button square for an icon, which then
needs an accessible name. Hover and pressed states darken the accent or strengthen the neutral fill.

### Edges

`vuiEdge` styles the visible SVG path of an edge; routing, hit targets and markers stay in core,
so attach `markers` in edge data and bind `ctx.markerEnd()`. Labels at `start`, `center` and `end` positions
are declared with the core `vEdgeLabel` structural directive inside the edge template; `vuiEdgeLabel` is their surface and can hold
`vuiActions` with native buttons.

### Viewport controls

`<vui-controls [flow]="flow">` renders zoom in, zoom out and fit view for the given `VflowComponent`
instance, clamped to its `minZoom`/`maxZoom`, and projects your own buttons, styled as `<button vuiButton="plain" vuiButtonIcon>`.
Position the element yourself, above the flow pane. Editing toggles, form controls and business actions are
not part of the library; `@vflow/ui` declares `ngx-vflow` as a peer dependency for this component.

### BPMN entry point

`import { VuiBpmn } from '@vflow/ui/bpmn'` adds the agreed subset on top of the shared parts: task,
start/intermediate/end events, exclusive and parallel gateways, pool and lane frames with a vertical
`vuiTitle`, and `vuiBpmnFlow` for sequence, message and association paths. Pools and lanes are
sized nodes drawn as frames; their parent relationships stay in graph data, and a pool can carry its own handles
for message flows. Execution semantics, BPMN XML and model validation belong to the application.

## Directive reference

| Import                                             | Attribute                                                                   | Responsibility                                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `VuiTheme`                                         | `[vuiTheme]="'light'"`                                                      | Scoped light/dark semantic tokens                                                                |
| `VuiSelected`                                      | `[vuiSelected]="ctx.selected() \|\| ctx.preselected()"`                     | Selection presentation; no interaction or ARIA changes                                           |
| `VuiNode`                                          | `vuiNode`                                                                   | Node surface; consumer chooses size and content                                                  |
| `VuiNodeHeader`, `VuiNodeBody`, `VuiNodeFooter`    | `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`                             | Optional anatomy on consumer elements                                                            |
| `VuiField`                                         | `vuiField`                                                                  | Field row with room for text roles and core handles                                              |
| `VuiContainer`                                     | `vuiContainer`                                                              | Tinted group with a hairline; parent relationships remain explicit in graph data                 |
| `VuiTitle`, `VuiMeta`                              | `vuiTitle`, `vuiMeta`                                                       | Primary wrapping text and secondary text in any shell                                            |
| `VuiIcon`, `VuiActions`                            | `vuiIcon`, `vuiActions`                                                     | Icon slot and a group of controls; add `vNoDrag` to each                                         |
| `VuiPort`                                          | `vuiPort handleType="target" position="left" [vuiPortConnected]="…"`        | A core handle with the port look: idle/valid/invalid from the handle, connected, `vuiPortReveal` |
| `VuiStatus`                                        | `[vuiStatus]="'warning'" [vuiStatusBusy]="true"`                            | Indicator: semantic tone, your text and optional activity                                        |
| `VuiEdge`                                          | `vuiEdge` on an SVG path                                                    | Stroke; bind core path and marker URLs yourself                                                  |
| `VuiEdgeLabel`                                     | `vuiEdgeLabel`                                                              | HTML label surface, including optional native controls                                           |
| `VuiToolbar`                                       | `vuiToolbar`                                                                | Surface for `v-node-toolbar` content                                                             |
| `VuiExternalLabel`                                 | `vuiExternalLabel`                                                          | Label below a positioned shape                                                                   |
| `VuiControls`                                      | `<vui-controls [flow]="flow">`                                              | Viewport controls for one flow instance; project plain icon buttons                              |
| `VuiBpmnEvent` (bpmn)                              | `[vuiBpmnEvent]="'start'"`                                                  | Start/intermediate/end event outlines                                                            |
| `VuiBpmnGateway` (bpmn)                            | `[vuiBpmnGateway]="'exclusive'"`                                            | Diamond with × or + marker; text goes in `vuiExternalLabel`                                      |
| `VuiBpmnTask`, `VuiBpmnPool`, `VuiBpmnLane` (bpmn) | `vuiBpmnTask`, `vuiBpmnPool`, `vuiBpmnLane`                                 | Task card, participant frame and lane frame                                                      |
| `VuiBpmnFlow` (bpmn)                               | `[vuiBpmnFlow]="'message'"` on an SVG path                                  | Sequence, message or association line style                                                      |
| `VuiButton`                                        | `vuiButton="secondary" vuiButtonSize="sm" vuiButtonIcon` on a native button | Primary, secondary and plain variants, two sizes, focus, pressed and disabled states             |

Each directive is independently importable. Apart from `vui-controls`, none imports ngx-vflow; none owns
graph state, adds wrapper elements, registers ports or changes accessibility roles. Public selectors are the
`.vui-*` classes named after the attributes, for example `.vui-title` or `.vui-status[data-vui-tone='warning']`;
context rules such as `.vui-container > .vui-title` style a role inside a shell.

## Themes and composition

Put `vuiTheme` on an ancestor of the whole flow so nodes, SVG edges, markers, labels, toolbars and
the minimap share its tokens. Different editors can have different themes on the same page, and a flow
outside every theme scope keeps the core defaults: importing the stylesheet never themes a flow by itself.

{{ NgDocActions.demo("ThemesDemoComponent", { container: false }) }}

Shared values are the theme variables below; the **Tokens** page shows their scales in both themes. Everything
else, such as card padding, row height or line width, derives from them or is ordinary CSS on the public
`.vui-*` selectors. Density follows `--vui-space`, typography `--vui-font-size`, and corners `--vui-radius`
with surfaces one grid unit rounder, so corners stay concentric.

```css
.my-editor {
  --vui-accent: #0f766e;
  --vui-selection: #0f766e;
  --vui-radius: 4px;
  --vui-space: 3px;
}
.my-editor .vui-port {
  width: 12px;
  height: 12px;
}
```

| Variables                                                                    | Purpose                                   |
| ---------------------------------------------------------------------------- | ----------------------------------------- |
| `--vui-canvas`, `--vui-surface`, `--vui-surface-muted`                       | Flow background, card and secondary fills |
| `--vui-foreground`, `--vui-muted`, `--vui-border`                            | Text, secondary text and hairlines        |
| `--vui-accent`, `--vui-on-accent`                                            | Primary action fill and its text          |
| `--vui-selection`                                                            | Selection and focus rings, selected edges |
| `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info`               | Status tones and port validity            |
| `--vui-font-sans`, `--vui-font-mono`, `--vui-font-size`                      | Typefaces and body size of the type scale |
| `--vui-space`, `--vui-radius`                                                | Grid unit and control radius              |
| `--vui-shadow-node`, `--vui-shadow-floating`, `--vui-duration`, `--vui-ease` | Elevation and motion                      |

Core has its own tokens with defaults for standalone use: the colors `--v-background`, `--v-surface`,
`--v-foreground`, `--v-muted`, `--v-border`, `--v-selection` and `--v-focus`, and the
focus ring geometry `--v-focus-width` (2px), `--v-focus-offset` (3px, the gap between a node and its
ring) and `--v-focus-radius` (0px, the corner radius of the node itself; the ring follows it, widened by
the offset, so it stays concentric). A theme scope maps the UI tokens onto them, `--vui-canvas` onto `--v-background`, `--vui-selection` onto
selection and focus, and the surface radius onto the ring radius since the node part is rounded with it; set a `--v-*` token on the flow element or any
descendant to override both. Under `forced-colors: active` core maps its tokens to system colors
regardless of the theme. Core also sets the read-only `--v-zoom` on the flow element, so scaled content
can keep screen-sized details (`calc(2px / var(--v-zoom, 1))`). The flow value is written when a
viewport change ends, not on every frame of a gesture, because a change recomputes the style of every
element of the flow. The node focus ring does not use it: its width and offset scale with the content, like
the node's border. The canvas minimap samples the resolved tokens and repaints when an
attribute changes on any ancestor of the flow (for example `data-vui-theme` or a class) or when the
`prefers-color-scheme` preference changes; edits to a stylesheet alone are not observed.

Keep the interaction stroke of custom edges inside the presentation with core `vEdgeInteraction`; use core gesture
exclusions such as `vNoDrag` and `vNoSelect` for embedded controls. Do not shrink a hit area just to make
its visual smaller. Keep status text alongside color and give icon-only buttons accessible names.

Core is headless: it ships no ready-made node, group, edge or label presentation and no appearance
inputs. Supply templates yourself or use these parts; see the migration guide in the Introduction section.
