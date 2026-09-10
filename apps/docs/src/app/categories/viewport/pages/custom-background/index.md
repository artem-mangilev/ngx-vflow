You're able to select background for your flow.

## Solid color

Set `--vflow-background` on the editor or an ancestor. Omit `[background]` or pass
`{ type: 'solid' }`; color strings are no longer accepted as background configuration.

{{ NgDocActions.demoPane("CustomBackgroundDemoComponent") }}

## Dots pattern

To make dots pattern, pass an object to the `[background]` input according to `DotsBackground` interface

{{ NgDocActions.demoPane("DotsCustomBackgroundDemoComponent") }}

## Image background

To make an image background, pass an object to the `[background]` input according to `ImageBackground` interface

{{ NgDocActions.demoPane("ImageCustomBackgroundDemoComponent") }}

## Grid pattern

To make grid pattern, pass an object to the `[background]` input according to `GridBackground` interface

{{ NgDocActions.demoPane("GridCustomBackgroundDemoComponent") }}

Pattern appearance uses `--vflow-background-dot-color`, `--vflow-background-dot-size`,
`--vflow-background-grid-color` and `--vflow-background-grid-width`. Sizes are CSS lengths
at zoom 1. Dot `gap` and grid cell `size` remain inputs; image source/repeat/fixed/scale
remain configuration. See the [migration guide](/design-system/styling).
