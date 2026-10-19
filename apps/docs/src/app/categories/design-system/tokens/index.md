Every value in `@vflow/ui` parts comes from a small set of scales. A part never picks a color, size or
radius of its own, so cards, rows, labels, toolbars and controls stay consistent with each other and with your
overrides. The visual language is neutral and dense, close to macOS: gray surfaces, a single accent, 13px
body text, hairline borders and concentric corners.

{{ NgDocActions.demo("TokensDemoComponent", { container: false }) }}

## Theme variables

Set these on a `data-vui-theme` scope or any element inside it. Everything else is derived from them.

| Variable                                                       | Light / dark            | Purpose                                                                         |
| -------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `--v-background`                                               | `#f5f5f7` / `#1c1c1e`   | Flow background                                                                 |
| `--v-surface`                                                  | `#fff` / `#2c2c2e`      | Nodes, labels, floating surfaces                                                |
| `--vui-surface-muted`                                          | 12% / 24% gray fill     | Groups, pools, hover; translucent so it works on any layer                      |
| `--v-foreground`, `--v-muted`                                  | at least 12.8:1 / 4.6:1 | Primary and secondary text, edge strokes                                        |
| `--v-border`                                                   | `#c6c6c8` / `#545458`   | Hairline border of a surface; separators inside it are the border at 50%        |
| `--vui-accent`, `--vui-on-accent`                              | `#0071e3` on white      | Primary button fill and its text (4.7:1 in both themes)                         |
| `--v-selection`, `--v-focus`                                   | `#0071e3` / `#0a84ff`   | Selection and focus rings, selected edges, connecting ports                     |
| `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info` | text-safe tones         | Status tones and port validity, at least 4.5:1 on the surface and on their tint |
| `--vui-font-size`                                              | `13px`                  | Body size; the type scale follows it                                            |
| `--vui-space`                                                  | `4px`                   | Grid unit; every padding, gap and control size follows it                       |
| `--vui-radius`                                                 | `6px`                   | Control radius; surfaces add one grid unit                                      |
| `--vui-shadow-node`, `--vui-shadow-floating`                   | per theme               | Resting node shadow (no blur) and floating layers                               |

The `--v-*` colors are core tokens: the theme sets them, and the flow and the parts read the same value. Transitions
use the application's Tailwind defaults (`--default-transition-duration`, `--default-transition-timing-function`).

The system `#007aff` blue is not used for the accent fill: white text on it reaches only 4.0:1. The dark theme
keeps the brighter `#0a84ff` for rings and lines, where it is a non-text indicator, which is why accent and
selection are separate variables. Accent is a fill: for colored text, such as a key badge in a row, use a tone
like `--vui-info`, which keeps 4.5:1 on the surface in both themes.

## Scales

| Scale     | Steps                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Type      | caption 11/14 (body − 2px), body 13/18, headline 13/18 semibold                                                                      |
| Spacing   | multiples of `--vui-space`: 0–8 units                                                                                                |
| Controls  | 24, 28, 32px (6, 7, 8 units); buttons and viewport controls 28px (`sm` 24px), rows 32px, ports 8px with a target of about 30 by 15px |
| Radius    | control `--vui-radius`, surface `--vui-radius + --vui-space`, full                                                                   |
| Elevation | nodes: hairline border and an unblurred shadow; toolbars and controls: translucent material                                          |

A status badge is a tint of its tone (16%) with text of the same hue mixed 80/20 with the foreground, so it
stays above 4.5:1 on its tint in both themes; it uses the control radius like buttons. Headers align every item to the first line of the title: an icon, a meta label, a badge or a button stays beside it
when the title wraps. The leading slot (`vuiIcon`) is at least four grid units wide and one line high and grows with
its content; a zero-width text strut centered in it gives it a baseline, so an icon, an avatar or any other small view is
centered on the first line of the title, whatever its size.

Parts use the application's typeface and letter spacing, set their own size, line height and weight,
and use grayscale antialiasing, as native macOS text does; without it light text on the dark theme renders
heavier. These settings are on the parts, not on the theme scope, so a `data-vui-theme` on your application root does not
change the rest of your page. Secondary text keeps the regular weight inside a header.

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

Parts are styled with Tailwind utilities in the `vui` namespace: `bg-vui-surface`, `text-vui-caption`,
`p-vui-3`, `rounded-vui-surface`, `shadow-vui-floating`. Tailwind's default theme is not part of the
stylesheet, so a part cannot use a value outside these scales. The build checks every class of every part
against the generated stylesheet and rejects arbitrary values other than system colors and documented
geometric constants.
