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
images, charts, notes, menus) is your content inside `vuiNodeBody` or a row.

| Area       | Parts                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Shells     | `vuiNode` with `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`; `vuiRow`; `vuiGroup` with `vuiGroupHeader` |
| Text roles | `vuiTitle`, `vuiMeta`, `vuiIcon`, `vuiActions`, usable in any shell, label or toolbar                      |
| Port       | `vuiPort` with `handleType`, `position` and the other handle inputs: a core handle with the port look      |
| Edge       | `vuiEdge` on the SVG path, `vuiEdgeLabel` for HTML labels                                                  |
| Extras     | `vuiStatus`, `vuiToolbar`, `vuiButton`                                                                     |

The node shell's resting shadow has no blur (`0 1px 0`). A blurred shadow is rasterized again for every visible node on every zoom step and pan, which on a large flow at a high device pixel ratio costs more GPU time than the rest of the node; see the measurement on the Virtualization page. Blurred shadows and translucent material are reserved for floating layers: toolbars and viewport controls.

Three kinds of state stay separate so they can be shown at once:

- **Interaction** is owned by core: bind the `selected` input of `vuiNode`, `vuiGroup` and `vuiEdge` to `ctx.selected() || ctx.preselected()`, or to a state of your own. Focus comes from the core wrapper.
- **Diagnostics** about the model and **application status** are both your vocabulary. Each is one `vuiStatus` indicator with a tone and your text; place two side by side to show a warning next to a running status. `vuiStatusBusy` adds a pulsing dot, which is presentation only and never disables anything; the text must name the activity ("Running", "Syncing"), and an indicator that changes while the user works belongs in a `role="status"` region of yours so screen readers hear it.
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

### Buttons

`vuiButton` takes a variant: `secondary` (the default, also for a bare `vuiButton`) for most actions, `primary` for
the one main action of an area, and `plain` for actions in rows, labels, toolbars and viewport controls. Write
`vuiButton="primary"` out, so the loudest button is always a choice. `vuiButtonSize="sm"` is 24px, the
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

## Directive reference

| Import                                          | Attribute                                                                 | Responsibility                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `VuiNode`                                       | `vuiNode [selected]="ctx.selected() \|\| ctx.preselected()"`              | Node surface; consumer chooses size and content                                                    |
| `VuiNodeHeader`, `VuiNodeBody`, `VuiNodeFooter` | `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`                           | Optional anatomy on consumer elements                                                              |
| `VuiRow`                                        | `vuiRow`                                                                  | Row (field, typed port, list item) with room for text roles and core handles                       |
| `VuiGroup`                                      | `vuiGroup [selected]="…"`                                                 | Tinted group with a hairline; parent relationships remain explicit in graph data                   |
| `VuiGroupHeader`                                | `vuiGroupHeader`                                                          | Title row of a group with room for meta, an icon and actions                                       |
| `VuiTitle`, `VuiMeta`                           | `vuiTitle`, `vuiMeta`                                                     | Primary wrapping text and secondary text in any shell                                              |
| `VuiIcon`, `VuiActions`                         | `vuiIcon`, `vuiActions`                                                   | Leading slot for an icon or avatar of any size, and a group of controls; add `vNoDrag` to controls |
| `VuiPort`                                       | `vuiPort handleType="target" position="left" [vuiPortConnected]="…"`      | A core handle with the port look: idle/valid/invalid from the handle, connected, `vuiPortReveal`   |
| `VuiStatus`                                     | `[vuiStatus]="'warning'" [vuiStatusBusy]="true"`                          | Indicator: semantic tone, your text and optional activity                                          |
| `VuiEdge`                                       | `vuiEdge [selected]="…"` on an SVG path                                   | Stroke; bind core path and marker URLs yourself                                                    |
| `VuiEdgeLabel`                                  | `vuiEdgeLabel`                                                            | HTML label surface, including optional native controls                                             |
| `VuiToolbar`                                    | `vuiToolbar`                                                              | Surface for `v-node-toolbar` content                                                               |
| `VuiControls`                                   | `<vui-controls [flow]="flow">`                                            | Viewport controls for one flow instance; project plain icon buttons                                |
| `VuiButton`                                     | `vuiButton="primary" vuiButtonSize="sm" vuiButtonIcon` on a native button | Secondary (default), primary and plain variants, two sizes, focus, pressed and disabled states     |

Each directive is independently importable. Apart from `vui-controls`, none imports ngx-vflow; none owns
graph state, adds wrapper elements, registers ports or changes accessibility roles. Public selectors are the
`.vui-*` classes named after the attributes, for example `.vui-title` or `.vui-status[data-vui-tone='warning']`.
A role looks the same in every shell; a row that needs its own look, such as a group title, is a part of its own.

## Themes and composition

Put `data-vui-theme="light"` or `data-vui-theme="dark"` on an ancestor of the whole flow, up to `<html>` in `index.html`, so nodes, SVG edges, markers, labels, toolbars and
the minimap share its tokens. Different editors can have different themes on the same page, and a flow
outside every theme scope keeps the core defaults: importing the stylesheet never themes a flow by itself.
Besides the tokens, a scope sets `color-scheme` to its theme and `accent-color` to `--vui-accent`, so native
checkboxes, radios and ranges inside it take the accent; both apply to all of your content in the scope.

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
| `--vui-foreground`, `--vui-muted`, `--vui-border`, `--vui-separator`         | Text, secondary text, borders, separators |
| `--vui-accent`, `--vui-on-accent`                                            | Primary action fill and its text          |
| `--vui-selection`                                                            | Selection and focus rings, selected edges |
| `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info`               | Status tones and port validity            |
| `--vui-font-sans`, `--vui-font-size`                                         | Typeface and body size of the type scale  |
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
