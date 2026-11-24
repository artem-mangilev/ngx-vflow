`@vflow/ui` is an optional design system for `ngx-vflow`, built on Tailwind CSS v4. Its parts are directives that
style elements of your own templates: cards, rows, ports, edges, groups, toolbars and viewport controls. A CLI copies
the parts and their tokens into your workspace, in the way of shadcn/ui, so the code is yours to edit.

The parts in complete applications: [Workflow](/examples/applications/workflow),
[Image pipeline](/examples/applications/pipeline), [ERD and schema mapping](/examples/applications/erd-schema-mapping)
and [Relationships map](/examples/applications/relationships-map).

## Install

The application needs Tailwind CSS v4 ([setup for Angular](https://tailwindcss.com/docs/installation/framework-guides/angular)).
Then, in the root of the workspace:

```bash
npx @vflow/cli ui
```

It copies `vflow-ui.css` next to the global stylesheet, imports it after `@import 'tailwindcss'`, and copies the
parts under the `@vflow/ui` import alias; see [CLI](/packages/cli). Import them next to `Vflow`:

```typescript
import { Vui } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

@Component({ imports: [Vflow, Vui] })
```

## Parts

A part adds a `.vui-*` class to your element and nothing else: no wrapper, no role, no graph state.

{% raw %}

```html
<article *vNode="let ctx" vuiNode>
  <header vuiNodeHeader><span vuiTitle>{{ ctx.data().title }}</span></header>
  <div vuiRow><span vuiMeta>{{ ctx.data().dataset }}</span></div>
  <span vuiPort handleType="target" position="left"></span>
  <span vuiPort handleType="source" position="right"></span>
</article>
```

{% endraw %}

| Part                                        | Use                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `vuiNode`, `vuiNodeHeader`, `vuiNodeFooter` | The card of a node and its optional header and footer                                |
| `vuiRow`                                    | A row: a field, a typed port, a list item                                            |
| `vuiGroup`, `vuiGroupHeader`                | A tinted group and its title row                                                     |
| `vuiTitle`, `vuiMeta`                       | Primary and secondary text in any part                                               |
| `vuiPort`                                   | A core handle with the port look; `[vuiPortConnected]` fills it while it has edges   |
| `vuiEdge`, `vuiEdgeLabel`                   | The SVG path of an edge and the surface of an HTML edge label                        |
| `vuiToolbar`                                | The surface of `v-node-toolbar` content                                              |
| `<vui-controls>`                            | Zoom in, zoom out and fit view for the flow it is in; projects your own icon buttons |

- Selection comes from core: a card, a group or an edge shows the selection of the node or edge it is in.
- A port shows the connection in progress from the `data-v-handle-state` of its handle: a halo while it can start a
  connection or is the candidate, filled when the candidate is valid.
- There are no buttons or badges: use the ones of your design system, with `vNoDrag` on controls inside a node.
- Place `<vui-controls>` with [`vPanel`](/docs/viewport/panel): `<vui-controls vPanel="bottom-left" />`.

## Themes

The light theme is the default. Put `data-vui-theme="dark"` on an ancestor of a flow, up to `<html>`, for the dark
one; `data-vui-theme="light"` forces light inside a dark scope. The nodes, edges, markers, toolbars and the minimap
all follow the scope.

{{ NgDocActions.demo("ThemesDemoComponent", { container: false }) }}

To restyle, override the theme roles on the scope, and the parts and the parts core draws change together:

```css
.my-editor[data-vui-theme] {
  --vui-accent: #0f766e;
  --vui-radius: 4px;
  --vui-space: 3px;
}
```

The roles, their values and the core tokens they set are on the [Tokens](/packages/ui/tokens) page. Everything else
is ordinary CSS on the `.vui-*` classes.
