Every color, size and radius of the parts comes from a few theme roles. The colors are the Tailwind palette: zinc
neutrals and one blue accent, as in shadcn/ui. Text is your application's: the parts inherit its typeface and use your
type utilities.

{{ NgDocActions.demo("TokensDemoComponent", { container: false }) }}

## Theme roles

`vflow-ui.css` sets the light values on `:root` and on `data-vui-theme="light"`, the dark ones on
`data-vui-theme="dark"`. Override a role on a scope to change it.

| Role                                         | Light / dark                              | Use                                                 |
| -------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `--vui-background`                           | zinc-50 / zinc-950                        | The canvas                                          |
| `--vui-surface`, `--vui-surface-muted`       | white / zinc-900; a translucent zinc fill | Cards, labels, toolbars; groups and hover           |
| `--vui-foreground`, `--vui-muted`            | zinc-950 / zinc-50; muted at least 4.5:1  | Text and edges                                      |
| `--vui-border`                               | zinc-200 / zinc-800                       | Hairlines and background dots                       |
| `--vui-accent`                               | blue-600 / blue-500                       | Selection, focus, connecting ports, resize controls |
| `--vui-success`, `--vui-danger`              | green and red                             | Port validity while connecting                      |
| `--vui-space`                                | `4px`                                     | Grid unit of every padding, gap and control size    |
| `--vui-radius`                               | `6px`                                     | Control radius; surfaces are one grid unit rounder  |
| `--vui-shadow-node`, `--vui-shadow-floating` | per theme                                 | Cards (no blur) and floating layers                 |

In Tailwind the roles are utilities of the `vui` namespace: `bg-vui-surface`, `text-vui-muted`, `p-vui-3`,
`rounded-vui-surface`, `shadow-vui-floating`.

## Core tokens

The parts core draws itself read their own `--v-*` tokens, listed in [Styling](/docs/getting-started/styling#core-tokens).
`vflow-ui.css` sets them from the roles, so a role override on a scope recolors core too:

| Core token                                        | Set from           |
| ------------------------------------------------- | ------------------ |
| `--v-background`                                  | `--vui-background` |
| `--v-background-pattern`                          | `--vui-border`     |
| `--v-selection-box`, `--v-focus`                  | `--vui-accent`     |
| `--v-resize-control`, `--v-resize-control-border` | accent, surface    |
| `--v-alignment-guides`                            | `--vui-foreground` |
| `--v-connection`                                  | `--vui-muted`      |
| `--v-minimap-node`, `--v-minimap-mask`            | mixes of muted     |
| `--v-minimap-node-radius`, `--v-focus-radius`     | the surface radius |

To change one core part only, set its core token on any element inside the scope.
