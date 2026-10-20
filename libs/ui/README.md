# @vflow/ui

Optional, directive-first design-system primitives for ngx-vflow. Requires Angular 20, 21 or 22.
It is not published as a package: `@vflow/cli` copies these sources and their tokens into your workspace.

Import individual directives or the `Vui` array from `@vflow/ui` into your standalone
component. They style your own HTML/SVG without adding wrappers; `vuiPort` is itself a core handle.

```html
<section data-vui-theme="light">
  <article vuiNode>
    <header vuiNodeHeader>
      <span vuiIcon aria-hidden="true">✓</span>
      <span vuiTitle>Review invoice</span>
    </header>
    <div vuiNodeBody>Your content and controls</div>
    <footer vuiNodeFooter>
      <span vuiMeta>Waiting for approval</span>
      <span vuiActions><button type="button" vNoDrag>Approve</button></span>
    </footer>
  </article>
</section>
```

## Styles

The application needs Tailwind CSS v4. `ng g @vflow/cli:ui` copies the tokens (`vflow-ui.css`) next to its global
stylesheet, imports them after Tailwind and copies the parts, whose utilities your Tailwind pipeline then generates. In this workspace `src/styles.css` compiles the parts for docs and e2e.

The parts use Tailwind utilities from the package's own `vui` theme keys (`bg-vui-surface`, `p-vui-3`,
`rounded-vui-surface`), without a Tailwind prefix, and the application's type utilities (`text-xs`,
`font-semibold`). A detail of one part is an arbitrary value in that part, not a key. Rules live in
cascade layers; unlayered application styles override them.

## Parts

| Area       | Parts                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Shells     | `vuiNode` with `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`; `vuiRow`; `vuiGroup` with `vuiGroupHeader` |
| Text roles | `vuiTitle`, `vuiMeta`, `vuiIcon`, `vuiActions`                                                             |
| Port       | `vuiPort`: a core handle with the port look                                                                |
| Edge       | `vuiEdge` on the SVG path, `vuiEdgeLabel` for HTML labels                                                  |
| Overlay    | `vuiToolbar`                                                                                               |
| Viewport   | `<vui-controls [flow]="flow">`: zoom in/out, fit view and your own buttons for one flow                    |

Buttons and badges come from your design system, as React Flow UI takes them from shadcn/ui; `vui-controls` gives
its projected buttons the look of its own.

Bind the `selected` input of `vuiNode`, `vuiGroup` and `vuiEdge` to `ctx.selected() || ctx.preselected()`. Put `vuiPort` with the handle inputs `handleType`,
`position`, `handleId`, `canStart` and `canAccept` on the element that is the connection point: it applies core
`vHandle` as a host directive and shows its connection feedback. For flow interaction compose the parts with core
gesture exclusions (`vNoDrag`, `vNoSelect`); a click on a presentation selects its node or edge, and
`vEdgeInteraction` keeps the edge hit area inside the group. UI never changes roles, focus or graph state.

## Theme

The light theme is the default on `:root`, like shadcn's. Put `data-vui-theme="dark"` on the editor ancestor (any element,
including `<html>`), or `data-vui-theme="light"` to force light inside a dark scope. A theme is a scope, as in shadcn:
override its roles on `:root` or on an element with `data-vui-theme`, where the core tokens are resolved from them.

- theme roles, read by the parts: `--vui-background`, `--vui-surface`, `--vui-surface-muted`, `--vui-foreground`,
  `--vui-muted`, `--vui-border`, `--vui-accent`, and the port validity tones `--vui-success`, `--vui-danger`;
- scales: `--vui-space`, `--vui-radius`;
- elevation: `--vui-shadow-node`, `--vui-shadow-floating`;
- core tokens, one per part core draws (`--v-selection-box`, `--v-resize-control`, `--v-focus`, `--v-minimap-mask`…):
  the theme sets them from the roles; override one on any element inside the scope to change only that part.

Text (typeface, size, line height, letter spacing) and transition timing come from the application.

Every size, padding and radius of the parts derives from `--vui-space` and `--vui-radius`. Part details are ordinary
CSS on the `.vui-*` selectors. An explicit `data-vui-theme` scope also sets `color-scheme` and `accent-color`. The
values are the Tailwind palette, as in shadcn/ui's zinc base with its blue theme; `--vui-accent` is the one accent.
States retain text/icons alongside their colors.

See the **Design system** ng-doc section for the complete directive/token reference and the workflow, pipeline,
ERD/mapping and relationships map recipes. Core is headless: it renders no presentation of its own, so every graph
uses these parts or your own templates.

Versions and releases are shared with ngx-vflow. See `docs/releasing.md` in the repository.
