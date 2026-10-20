Every color, size and radius in `@vflow/ui` parts comes from a small set of scales, so cards, rows, labels,
toolbars and controls stay consistent with each other and with your overrides. Text is your application's. The
colors are the Tailwind palette, as in shadcn/ui's zinc base with its blue theme: zinc neutrals, white surfaces, light
hairline borders and one saturated accent; the layout is dense, with concentric corners.

{{ NgDocActions.demo("TokensDemoComponent", { container: false }) }}

## Theme variables

The light values sit on `:root` and a `data-vui-theme` scope; override them on a scope so the core tokens follow (see Overview). Everything else is derived from them. Colors are oklch.

| Role                                         | Light / dark                                                                  | Purpose                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--vui-background`                           | zinc-50 `oklch(0.985 0 0)` / zinc-950 `oklch(0.141 0.005 285.823)`            | Flow background                                                                             |
| `--vui-surface`                              | white / zinc-900 `oklch(0.21 0.006 285.885)`                                  | Nodes, labels, floating surfaces                                                            |
| `--vui-surface-muted`                        | 10% / 8% zinc fill                                                            | Groups, hover; translucent so it works on any layer                                         |
| `--vui-foreground`, `--vui-muted`            | zinc-950 / zinc-50; at least 4.6:1 for muted                                  | Primary and secondary text, edge strokes                                                    |
| `--vui-border`                               | zinc-200 `oklch(0.92 0.004 286.32)` / zinc-800 `oklch(0.274 0.006 286.033)`   | Hairline border of a surface, background dots; separators are the border at 50%             |
| `--vui-accent`                               | blue-600 `oklch(0.546 0.245 262.881)` / blue-500 `oklch(0.623 0.214 259.815)` | Selection and focus rings, selected edges, connecting ports, resize controls, selection box |
| `--vui-success`, `--vui-danger`              | green-600 and red-600 / green-500 and red-400                                 | Port validity while connecting, at least 3:1 on the background                              |
| `--vui-space`                                | `4px`                                                                         | Grid unit; every padding, gap and control size follows it                                   |
| `--vui-radius`                               | `6px`                                                                         | Control radius; surfaces add one grid unit                                                  |
| `--vui-shadow-node`, `--vui-shadow-floating` | per theme                                                                     | Resting node shadow (no blur) and floating layers                                           |

The core `--v-*` tokens are set from these roles by the mapping block of `vflow-ui.css`; the parts never read them. Transitions
use the application's Tailwind defaults (`--default-transition-duration`, `--default-transition-timing-function`).

The theme has one accent, `--vui-accent`, which also colors the core focus ring; the parts ship no buttons or badges, so
there is no accent fill under text. The accent keeps at least 4.7:1 on the background and the surface in both themes, so it also works for colored
text such as a key marker in a row. Light `--vui-muted` is a step darker than zinc-500, so secondary text keeps 4.5:1
on the group fill.

## Scales

| Scale     | Steps                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Spacing   | multiples of `--vui-space`: 0–8 units                                                                        |
| Controls  | 24, 28, 32px (6, 7, 8 units); viewport controls 28px, rows 32px, ports 8px with a target of about 30 by 15px |
| Radius    | control `--vui-radius`, surface `--vui-radius + --vui-space`, full                                           |
| Elevation | nodes: hairline border and an unblurred shadow; toolbars and controls: translucent material                  |

Headers align every item to the first line of the title: an icon, a meta label, a badge or a button stays beside it
when the title wraps. The leading slot (`vuiIcon`) is at least four grid units wide and one line high and grows with
its content; a zero-width text strut centered in it gives it a baseline, so an icon, an avatar or any other small view is
centered on the first line of the title, whatever its size.

Text is your application's, as in React Flow UI: parts inherit its typeface, size, line height and letter spacing
and use its Tailwind type utilities, `text-xs` for meta and edge labels and `font-semibold` for headers. Secondary text keeps the regular weight
inside a header. Parts use grayscale antialiasing, as native macOS text does; without it light text on the dark theme
renders heavier. This setting is on the parts, not on the theme, so it does not change the rest of your page.

Inside a card, the header, footer and field separators are the card border at half strength, so
the card reads as one surface and follows any border override. A group is a tinted surface with a hairline, not a dashed frame.

Corners are concentric: the viewport controls wrap their buttons at one grid unit, so their radius is the button
radius plus one unit. Change `--vui-radius` or `--vui-space` and the relation holds.

Nodes never get a blurred shadow or backdrop blur. Both are rasterized again for every visible node on each
zoom step and pan; see the Virtualization page. The floating material is reserved for the few overlays above
the graph.

## Utilities

Parts are styled with Tailwind utilities: the `vui` namespace for the scales and colors above (`bg-vui-surface`,
`p-vui-3`, `rounded-vui-surface`, `shadow-vui-floating`) and your theme's type utilities. A detail that belongs to one
part, such as the port ring width and its halo or the strut of the icon slot, is an arbitrary value in that part, not a
token.
