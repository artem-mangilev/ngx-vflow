`@vflow/ui` is an optional, directive-first design system for `ngx-vflow`.
You own the HTML/SVG structure; directives add presentation without wrapping it.
The package is developed in this workspace and will first be published with the next major release.

## Core and UI boundary

Core owns positions, hit areas, focus, keyboard behavior, wrapper semantics and interaction eligibility.
Business logic, node content and graph state belong to your application. `@vflow/ui` sits between them:
stable anatomy, states and a CSS token contract for cards, fields, ports, edges, groups and toolbars.

Each page in this section shows one reference composition, its code and its limitations:

- `Workflow` — cards, branching, edge labels, native actions, independent status and diagnostics, viewport controls.
- `Data and media pipeline` — typed labeled ports, rich body content, native controls inside nodes.
- `ERD and schema mapping` — rows with ports for entity fields, stable field IDs through rename, reorder and deletion, a scroll/collapse experiment.
- `Relationships and metrics map` — groups with their own connections, a note without ports, metrics and images, view mode.

## Setup

Import individual directives or the `Vui` convenience array alongside `Vflow`:

```typescript
import { Vui } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

// In your standalone component:
// imports: [Vflow, Vui]
```

The parts and their tokens are copied into your workspace by `@vflow/cli`, in the way of shadcn/ui and spartan-ng,
so the code is yours to edit. The application needs Tailwind CSS v4
([setup for Angular](https://tailwindcss.com/docs/installation/framework-guides/angular)):

```bash
npm i -D @vflow/cli
ng g @vflow/cli:ui # or: nx g @vflow/cli:ui
```

`ui` adds `ngx-vflow` and `@angular/cdk` when they are missing, copies `vflow-ui.css` next to the global stylesheet
and imports it after `@import 'tailwindcss'`, then copies the parts and maps them to the `@vflow/ui` import alias:
an Nx library in Nx, a tsconfig path in Angular CLI. Your Tailwind pipeline generates their utilities. Run it again
with `--project` to add the tokens to another application.

UI rules live in Tailwind cascade layers, so unlayered application CSS overrides them without `!important`.

## Anatomy and states

Directives add a public class to your own element and nothing else: no wrappers, no roles, no graph state.
Compose the parts with plain HTML and content projection; anything not listed here (descriptions, forms,
images, charts, notes, menus) is your content inside `vuiNodeBody` or a row.

| Area       | Parts                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Shells     | `vuiNode` with `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`; `vuiRow`; `vuiGroup` with `vuiGroupHeader` |
| Text roles | `vuiTitle`, `vuiMeta`, `vuiIcon`, `vuiActions`, usable in any shell, label or toolbar                      |
| Port       | `vuiPort` with `handleType`, `position` and the other handle inputs: a core handle with the port look      |
| Edge       | `vuiEdge` on the SVG path, `vuiEdgeLabel` for HTML labels                                                  |
| Overlay    | `vuiToolbar`                                                                                               |

The node shell's resting shadow has no blur (`0 1px 0`). A blurred shadow is rasterized again for every visible node on every zoom step and pan, which on a large flow at a high device pixel ratio costs more GPU time than the rest of the node; see the measurement on the Virtualization page. Blurred shadows and translucent material are reserved for floating layers: toolbars and viewport controls.

Three kinds of state stay separate so they can be shown at once:

- **Interaction** is owned by core: bind the `selected` input of `vuiNode`, `vuiGroup` and `vuiEdge` to `ctx.selected() || ctx.preselected()`, or to a state of your own. Focus comes from the core wrapper.
- **Diagnostics** about the model and **application status** are both your vocabulary and your components: one badge of your design system per message, so a warning and a running status sit side by side. A status is presentation only and never disables anything; let the text name the activity ("Running", "Syncing"), and put an indicator that changes while the user works in a `role="status"` region of yours so screen readers hear it.
- **Action availability** is the native `disabled` attribute on your buttons, driven by your rules such as read-only.

Ports mirror two independent facts: the core feedback for the connection in progress (`idle`, `valid`, `invalid`),
read from the core handle that `vuiPort` applies to the same element (`vuiPortState` only overrides it); `vuiPortConnected` is your
knowledge about existing edges. An idle port is an 8px ring, filled once connected. A hovered port that can start a connection,
the port a connection is drawn from and the candidate under the pointer get a halo in the state color (selection,
success, danger) that draws the ring 2px larger without changing its box, so the endpoint never moves. A valid
candidate is filled and an invalid one stays hollow, so the state does not depend on color alone. A pseudo-element
widens the pointer target to about 30px along the node side and
15px deep into the node, never outward, where the end of a connected edge takes reconnection presses; the endpoint does not move. `vuiPortReveal="interaction"` keeps idle ports without edges invisible until their node is hovered,
focused or selected, which suits diagrams that draw no connection points. While a connection is drawn,
the ports of a node appear when the pointer reaches it; ports of other nodes stay hidden but remain targets. Hover does
not follow a finger, so keep the default `always` where users connect by touch.

### Buttons and badges

The parts ship no button and no badge: those already exist in your design system (spartan-ng, Angular Material or
your own), as React Flow UI takes them from shadcn/ui. Put them in `vuiActions`, rows, labels and toolbars, add
`vNoDrag` to controls inside a node, and give icon-only buttons accessible names. The demos in this section style a
button and a badge of their own with the theme variables, so they follow light and dark scopes.

### Edges

`vuiEdge` styles the visible SVG path of an edge; routing, hit targets and markers stay in core,
so attach `markers` in edge data and bind `ctx.markerEnd()`. Labels at `start`, `center` and `end` positions
are declared with the core `vEdgeLabel` structural directive inside the edge template; `vuiEdgeLabel` is their surface and can hold
`vuiActions` with native buttons.

### Viewport controls

`<vui-controls [flow]="flow">` renders zoom in, zoom out and fit view for the given `VflowComponent`
instance, clamped to its `minZoom`/`maxZoom`, and projects your own buttons: every button child, built-in or projected,
is a square icon button without a fill at rest, so give a projected one an accessible name.
Position the element yourself, above the flow pane. Editing toggles, form controls and business actions are
not part of the library; `@vflow/ui` declares `ngx-vflow` as a peer dependency for this component.

## Directive reference

| Import                                          | Attribute                                                            | Responsibility                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `VuiNode`                                       | `vuiNode [selected]="ctx.selected() \|\| ctx.preselected()"`         | Node surface; consumer chooses size and content                                                    |
| `VuiNodeHeader`, `VuiNodeBody`, `VuiNodeFooter` | `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`                      | Optional anatomy on consumer elements                                                              |
| `VuiRow`                                        | `vuiRow`                                                             | Row (field, typed port, list item) with room for text roles and core handles                       |
| `VuiGroup`                                      | `vuiGroup [selected]="…"`                                            | Tinted group with a hairline; parent relationships remain explicit in graph data                   |
| `VuiGroupHeader`                                | `vuiGroupHeader`                                                     | Title row of a group with room for meta, an icon and actions                                       |
| `VuiTitle`, `VuiMeta`                           | `vuiTitle`, `vuiMeta`                                                | Primary wrapping text and secondary text in any shell                                              |
| `VuiIcon`, `VuiActions`                         | `vuiIcon`, `vuiActions`                                              | Leading slot for an icon or avatar of any size, and a group of controls; add `vNoDrag` to controls |
| `VuiPort`                                       | `vuiPort handleType="target" position="left" [vuiPortConnected]="…"` | A core handle with the port look: idle/valid/invalid from the handle, connected, `vuiPortReveal`   |
| `VuiEdge`                                       | `vuiEdge [selected]="…"` on an SVG path                              | Stroke; bind core path and marker URLs yourself                                                    |
| `VuiEdgeLabel`                                  | `vuiEdgeLabel`                                                       | HTML label surface, including optional native controls                                             |
| `VuiToolbar`                                    | `vuiToolbar`                                                         | Surface for `v-node-toolbar` content                                                               |
| `VuiControls`                                   | `<vui-controls [flow]="flow">`                                       | Viewport controls for one flow instance; project plain icon buttons                                |

Each directive is independently importable. Apart from `vui-controls`, none imports ngx-vflow; none owns
graph state, adds wrapper elements, registers ports or changes accessibility roles. Public selectors are the
`.vui-*` classes named after the attributes, for example `.vui-title` or `.vui-port[data-vui-state='valid']`.
A role looks the same in every shell; a row that needs its own look, such as a group title, is a part of its own.

## Themes and composition

The light theme is the default: `vflow-ui.css` sets it on `:root`, like shadcn, so every flow of your application
takes it once the generator has copied the file in. Put `data-vui-theme="dark"` on an ancestor of the whole flow, up to
`<html>` in `index.html`, so nodes, SVG edges, markers, labels, toolbars and the minimap share the dark tokens;
`data-vui-theme="light"` forces light inside a dark scope. Different editors can have different themes on the same
page. Only an explicit scope sets `color-scheme` to its theme and `accent-color` to `--vui-accent`, so native checkboxes, radios and ranges inside it take it; both apply to all of your content in the scope.

{{ NgDocActions.demo("ThemesDemoComponent", { container: false }) }}

Tokens come in three levels, each with one owner:

1. **Theme roles**, `--vui-*`, in your copy of `vflow-ui.css`: colors, shadows and scales, as shadcn's `--background`,
   `--card` or `--primary`. The parts read only these.
2. **Core tokens**, `--v-*`: one per part core draws itself, named after its public class, with defaults for a flow
   without the UI theme. Core reads only these.
3. **The mapping**: a block in `vflow-ui.css` sets the core tokens from the roles, for example
   `--v-selection-box: var(--vui-accent)`.

As in shadcn, a theme is a scope: `:root` or an element with `data-vui-theme`. The mapping resolves on the scope
element, so override roles there to recolor the parts and core alike; an override on an element without the attribute
restyles the parts only. To change one core part, override its core token on any element inside the scope.

The **Tokens** page shows the scales in both themes. Everything else, such as card padding, row height or line width,
derives from the roles or is ordinary CSS on the public `.vui-*` selectors. Density follows `--vui-space` and corners
`--vui-radius` with surfaces one grid unit rounder, so corners stay concentric. Text is yours: the parts inherit your
typeface and size and use your Tailwind type utilities (`text-xs`, `font-semibold`) for meta, labels and titles.

```css
.my-editor[data-vui-theme] {
  --vui-accent: #0f766e;
  --vui-radius: 4px;
  --vui-space: 3px;
}
.my-editor .vui-port {
  width: 12px;
  height: 12px;
}
```

| Theme roles                                                | Purpose                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `--vui-background`, `--vui-surface`, `--vui-surface-muted` | Flow background, card and secondary fills                     |
| `--vui-foreground`, `--vui-muted`, `--vui-border`          | Text, secondary text and edges, borders                       |
| `--vui-accent`                                             | The one accent: selection, focus, connecting, native controls |
| `--vui-success`, `--vui-danger`                            | Port validity                                                 |
| `--vui-space`, `--vui-radius`                              | Grid unit and control radius                                  |
| `--vui-shadow-node`, `--vui-shadow-floating`               | Elevation                                                     |

| Core token                                                | Part                                                                     | Theme sets              |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| `--v-background`                                          | Flow canvas (`.v-root`); also fills nodes in the minimap                 | `--vui-background`      |
| `--v-background-pattern`                                  | Dots and grid lines (`.v-background-pattern`)                            | `--vui-border`          |
| `--v-selection-box`                                       | `.v-selection-box` stroke; its fill is the color at 12%                  | `--vui-accent`          |
| `--v-resize-control`, `--v-resize-control-border`         | `.v-resize-control` handles and lines; the handle border                 | accent, surface         |
| `--v-alignment-guides`                                    | `.v-alignment-guides`, at 50%                                            | `--vui-foreground`      |
| `--v-connection`                                          | The line of a connection in progress without a template                  | `--vui-muted`           |
| `--v-minimap-mask`, `--v-minimap-selected`                | Minimap mask (35%) and outlines; selected node outline                   | muted, accent           |
| `--v-focus`                                               | Focus ring of nodes, edges and the flow container                        | `--vui-accent`          |
| `--v-focus-width`, `--v-focus-offset`, `--v-focus-radius` | Focus ring geometry: 2px, 3px (the gap between a node and its ring), 0px | radius = surface radius |
| `--v-node-toolbar-offset`                                 | Gap between a node and `<v-node-toolbar>`, 10px                          | —                       |

The focus radius is the corner radius of the node itself; the ring follows it, widened by the offset, so it stays
concentric, and the theme sets it to the surface radius since the node part is rounded with it. Without the UI theme a
flow keeps core's defaults, and a core token set on any ancestor reaches the flow. Under `forced-colors: active` core
maps its tokens to system colors regardless of the theme. Core also sets the read-only `--v-zoom` on the flow element,
so scaled content can keep screen-sized details (`calc(2px / var(--v-zoom, 1))`). The flow value is written when a
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
