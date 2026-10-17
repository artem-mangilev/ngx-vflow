# @vflow/ui

Optional, directive-first design-system primitives for ngx-vflow. Requires Angular 20 or 21.
This package is developed locally and will first be published with the next ngx-vflow major release.

Import individual directives or the `Vui` array from `@vflow/ui` into your standalone
component. They style your own HTML/SVG without adding wrappers; `vuiPort` is itself a core handle.

```html
<section vuiTheme="light">
  <article vuiNode>
    <header vuiNodeHeader>
      <span vuiIcon aria-hidden="true">✓</span>
      <span vuiTitle>Review invoice</span>
    </header>
    <div vuiNodeBody>Your content and controls</div>
    <footer vuiNodeFooter>
      <span vuiStatus="warning">Waiting for approval</span>
      <span vuiStatus="danger">Missing PO</span>
      <span vuiActions><button vuiButton="primary" type="button">Approve</button></span>
    </footer>
  </article>
</section>
```

## Styles

Include `@vflow/ui/styles.css` in your application's global styles. It is compiled with Tailwind 4 (utilities
only, no Preflight) and needs no Tailwind on your side. If you run Tailwind v4 yourself, import
`@vflow/ui/styles.source.css` as a separate global stylesheet instead and let your pipeline compile it.

The parts use Tailwind utilities from the package's own `vui` theme keys (`bg-vui-surface`, `p-vui-3`,
`rounded-vui-surface`), without a Tailwind prefix and without Tailwind's default theme. Rules live in cascade
layers; unlayered application styles override them.

## Parts

| Area       | Parts                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Shells     | `vuiNode` with `vuiNodeHeader`, `vuiNodeBody`, `vuiNodeFooter`; `vuiRow`; `vuiContainer` with `vuiContainerHeader` |
| Text roles | `vuiTitle`, `vuiMeta`, `vuiIcon`, `vuiActions`                                                                     |
| Port       | `vuiPort`: a core handle with the port look                                                                        |
| Edge       | `vuiEdge` on the SVG path, `vuiEdgeLabel` for HTML labels                                                          |
| Extras     | `vuiStatus`, `vuiToolbar`, `vuiButton` (`secondary` by default, `primary`, `plain`)                                |
| State      | `vuiTheme`, `vuiSelected`                                                                                          |
| Viewport   | `<vui-controls [flow]="flow">`: zoom in/out, fit view and your own buttons for one flow                            |

Bind `vuiSelected` to `ctx.selected() || ctx.preselected()`. Put `vuiPort` with the handle inputs `handleType`,
`position`, `handleId`, `canStart` and `canAccept` on the element that is the connection point: it applies core
`vHandle` as a host directive and shows its connection feedback. For flow interaction compose the parts with core
gesture exclusions (`vNoDrag`, `vNoSelect`); a click on a presentation selects its node or edge, and
`vEdgeInteraction` keeps the edge hit area inside the group. UI never changes roles, focus or graph state.

## Theme

Use `vuiTheme="light"` or `vuiTheme="dark"` on the editor ancestor and override the theme variables to match your
application:

- colors: `--vui-canvas`, `--vui-surface`, `--vui-surface-muted`, `--vui-foreground`, `--vui-muted`,
  `--vui-border`, `--vui-separator`, `--vui-accent`, `--vui-on-accent`, `--vui-selection`, and the tones
  `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info`;
- scales: `--vui-font-sans`, `--vui-font-size`, `--vui-space`, `--vui-radius`;
- elevation and motion: `--vui-shadow-node`, `--vui-shadow-floating`, `--vui-duration`, `--vui-ease`.

Every size, padding and radius of the parts derives from `--vui-font-size`, `--vui-space` and `--vui-radius`. Part
details are ordinary CSS on the `.vui-*` selectors. A theme scope also maps core feedback (`--v-*`) to the same
values and sets `color-scheme` and `accent-color`; a flow outside a theme scope keeps core defaults. States retain
text/icons alongside their colors.

See the **Design system** ng-doc section for the complete directive/token reference and the workflow, pipeline,
ERD/mapping and relationships map recipes. Core is headless: it renders no presentation of its own, so every graph
uses these parts or your own templates.

Versions and releases are shared with ngx-vflow. See `docs/releasing.md` in the repository.
