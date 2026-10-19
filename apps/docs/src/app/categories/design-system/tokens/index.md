Every color, size and radius in `@vflow/ui` parts comes from a small set of scales, so cards, rows, labels,
toolbars and controls stay consistent with each other and with your overrides. Text is your application's. The
visual language is neutral and dense, close to macOS: gray surfaces, a single accent, hairline borders and
concentric corners.

{{ NgDocActions.demo("TokensDemoComponent", { container: false }) }}

## Theme variables

The light values sit on `:root` and a `data-vui-theme` scope; override any of them on any element. Everything else is derived from them. Colors are oklch.

| Variable                                                       | Light / dark                                            | Purpose                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `--v-background`                                               | `oklch(0.971 0.003 286.4)` / `oklch(0.227 0.004 286.1)` | Flow background                                                                 |
| `--v-surface`                                                  | `oklch(1 0 0)` / `oklch(0.294 0.004 286.2)`             | Nodes, labels, floating surfaces                                                |
| `--vui-surface-muted`                                          | 12% / 24% gray fill                                     | Groups, pools, hover; translucent so it works on any layer                      |
| `--v-foreground`, `--v-muted`                                  | at least 12.8:1 / 4.6:1                                 | Primary and secondary text, edge strokes                                        |
| `--v-border`                                                   | `oklch(0.827 0.003 286.3)` / `oklch(0.447 0.006 286.1)` | Hairline border of a surface; separators inside it are the border at 50%        |
| `--vui-accent`, `--vui-on-accent`                              | `oklch(0.563 0.193 256.2)` on white                     | Primary button fill and its text (4.7:1 in both themes)                         |
| `--v-selection`, `--v-focus`                                   | `oklch(0.563 0.193 256.2)` / `oklch(0.624 0.206 255.5)` | Selection and focus rings, selected edges, connecting ports                     |
| `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info` | text-safe tones                                         | Status tones and port validity, at least 4.5:1 on the surface and on their tint |
| `--vui-space`                                                  | `4px`                                                   | Grid unit; every padding, gap and control size follows it                       |
| `--vui-radius`                                                 | `6px`                                                   | Control radius; surfaces add one grid unit                                      |
| `--vui-shadow-node`, `--vui-shadow-floating`                   | per theme                                               | Resting node shadow (no blur) and floating layers                               |

The `--v-*` colors are core tokens: the theme sets them, and the flow and the parts read the same value. Transitions
use the application's Tailwind defaults (`--default-transition-duration`, `--default-transition-timing-function`).

The brighter system blue is not used for the accent fill: white text on it reaches only 4.0:1. The dark theme
keeps it for rings and lines, where it is a non-text indicator, which is why accent and
selection are separate variables. Accent is a fill: for colored text, such as a key badge in a row, use a tone
like `--vui-info`, which keeps 4.5:1 on the surface in both themes.

## Scales

| Scale     | Steps                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Spacing   | multiples of `--vui-space`: 0–8 units                                                                                                |
| Controls  | 24, 28, 32px (6, 7, 8 units); buttons and viewport controls 28px (`sm` 24px), rows 32px, ports 8px with a target of about 30 by 15px |
| Radius    | control `--vui-radius`, surface `--vui-radius + --vui-space`, full                                                                   |
| Elevation | nodes: hairline border and an unblurred shadow; toolbars and controls: translucent material                                          |

A status badge is a tint of its tone (16%) with text of the same hue mixed 80/20 with the foreground, so it
stays above 4.5:1 on its tint in both themes; it uses the control radius like buttons. Headers align every item to the first line of the title: an icon, a meta label, a badge or a button stays beside it
when the title wraps. The leading slot (`vuiIcon`) is at least four grid units wide and one line high and grows with
its content; a zero-width text strut centered in it gives it a baseline, so an icon, an avatar or any other small view is
centered on the first line of the title, whatever its size.

Text is your application's, as in React Flow UI: parts inherit its typeface, size, line height and letter spacing
and use its Tailwind type utilities, `text-xs` for meta, statuses and edge labels, `text-sm` for buttons,
`font-medium` for button and status labels and `font-semibold` for headers. Secondary text keeps the regular weight
inside a header. Parts use grayscale antialiasing, as native macOS text does; without it light text on the dark theme
renders heavier. This setting is on the parts, not on the theme, so it does not change the rest of your page.

Buttons come in three variants on the same 28px (or 24px `sm`) geometry: a neutral `secondary` fill, the default,
the accent `primary` for the one main action of an area and a `plain` button without a fill at rest. Hover and pressed darken the
accent or strengthen the neutral fill toward the foreground; the steps derive from the theme, so they need no
variables of their own.

Inside a card, the header, footer and field separators are the card border at half strength, so
the card reads as one surface and follows any border override. A group is a tinted surface with a hairline, not a dashed frame.

Corners are concentric: a toolbar wraps its buttons at one grid unit, so its radius is the button radius plus
one unit. Change `--vui-radius` or `--vui-space` and the relation holds.

Nodes never get a blurred shadow or backdrop blur. Both are rasterized again for every visible node on each
zoom step and pan; see the Virtualization page. The floating material is reserved for the few overlays above
the graph.

## Utilities

Parts are styled with Tailwind utilities: the `vui` namespace for the scales and colors above (`bg-vui-surface`,
`p-vui-3`, `rounded-vui-surface`, `shadow-vui-floating`) and your theme's type utilities. A detail that belongs to one
part, such as the port ring width and its halo or the strut of the icon slot, is an arbitrary value in that part, not a
token.
