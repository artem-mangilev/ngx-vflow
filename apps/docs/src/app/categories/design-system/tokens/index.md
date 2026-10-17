Every value in `@vflow/ui` parts comes from a small set of scales. A part never picks a color, size or
radius of its own, so cards, rows, labels, toolbars and controls stay consistent with each other and with your
overrides. The visual language is neutral and dense, close to macOS: gray surfaces, a single accent, 13px
body text, hairline borders and concentric corners.

{{ NgDocActions.demo("TokensDemoComponent", { container: false }) }}

## Theme variables

Set these on a `vuiTheme` scope or any element inside it. Everything else is derived from them.

| Variable                                                       | Light / dark            | Purpose                                                                         |
| -------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `--vui-canvas`                                                 | `#f5f5f7` / `#1c1c1e`   | Flow background (`--v-background`)                                              |
| `--vui-surface`                                                | `#fff` / `#2c2c2e`      | Nodes, labels, floating surfaces                                                |
| `--vui-surface-muted`                                          | 12% / 24% gray fill     | Containers, pools, hover; translucent so it works on any layer                  |
| `--vui-foreground`, `--vui-muted`                              | at least 12.8:1 / 4.6:1 | Primary and secondary text, edge strokes                                        |
| `--vui-border`                                                 | `#c6c6c8` / `#545458`   | Hairline borders and separators                                                 |
| `--vui-accent`, `--vui-on-accent`                              | `#0071e3` on white      | Primary button fill and its text (4.7:1 in both themes)                         |
| `--vui-selection`                                              | `#0071e3` / `#0a84ff`   | Selection and focus rings, selected edges, connecting ports                     |
| `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info` | text-safe tones         | Status tones and port validity, at least 4.5:1 on the surface and on their tint |
| `--vui-font-sans`, `--vui-font-mono`                           | system stack            | Typefaces                                                                       |
| `--vui-font-size`                                              | `13px`                  | Body size; the type scale follows it                                            |
| `--vui-space`                                                  | `4px`                   | Grid unit; every padding, gap and control size follows it                       |
| `--vui-radius`                                                 | `6px`                   | Control radius; surfaces add one grid unit                                      |
| `--vui-shadow-node`, `--vui-shadow-floating`                   | per theme               | Resting node shadow (no blur) and floating layers                               |
| `--vui-duration`, `--vui-ease`                                 | `150ms`, standard curve | Hover and state transitions                                                     |

The system `#007aff` blue is not used for the accent fill: white text on it reaches only 4.0:1. The dark theme
keeps the brighter `#0a84ff` for rings and lines, where it is a non-text indicator, which is why accent and
selection are separate variables. Accent is a fill: for colored text, such as a key badge in a field row, use a tone
like `--vui-info`, which keeps 4.5:1 on the surface in both themes.

## Scales

| Scale     | Steps                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Type      | caption 11/14 (body − 2px), body 13/18, headline 13/18 semibold                                                                    |
| Spacing   | multiples of `--vui-space`: 1–8, 10, 12, 14, 16 units                                                                              |
| Controls  | 24, 28, 32px (6, 7, 8 units); buttons and viewport controls 28px (`sm` 24px), field rows 32px, ports 12px with a 28 by 20px target |
| Radius    | control `--vui-radius`, surface `--vui-radius + --vui-space`, full                                                                 |
| Elevation | nodes: hairline border and an unblurred shadow; toolbars and controls: translucent material                                        |

A status badge is a tint of its tone (16%) with text of the same hue mixed 80/20 with the foreground, so it
stays above 4.5:1 on its tint in both themes; it uses the control radius like buttons. Headers align every item to the first line of the title: an icon, a meta label, a badge or a button stays beside it
when the title wraps. The icon slot is four grid units wide and one line high, with a zero-width text strut that gives it
the line's baseline, so a 16px SVG is centered on that line.

Parts set their own font family, size, line height and weight, and reset the letter spacing an application may set on
its body. A theme scope turns on grayscale antialiasing, as native macOS text does; without it light text on the dark
theme renders heavier. Text inside your node content keeps your own typography.

Buttons come in three variants on the same 28px (or 24px `sm`) geometry: the accent `primary` for the one main
action of an area, a neutral `secondary` fill and a `plain` button without a fill at rest. Hover and pressed darken the
accent or strengthen the neutral fill toward the foreground; the steps derive from the theme, so they need no
variables of their own.

Inside a card, the header, footer and field separators are half as strong as the card border, so the card reads as
one surface. A container is a tinted group with a hairline, not a dashed frame.

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
