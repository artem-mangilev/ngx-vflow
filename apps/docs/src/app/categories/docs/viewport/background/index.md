You're able to select a background pattern for your flow.

## Canvas color

The canvas color is CSS: set the `--v-background` token on the `vflow` element or any ancestor. Pattern
colors (dots, grid) follow `--v-background-pattern`; the `data-v-background-pattern` attribute is the public selector
for finer control.

The demo sets both tokens on the `vflow` element and mixes their colors from the accent color of the theme.

{{ NgDocActions.demoPane("CustomBackgroundDemoComponent") }}

## Dots pattern

To make dots pattern, pass an object to the `[background]` input according to `DotsBackground` interface

{{ NgDocActions.demoPane("DotsCustomBackgroundDemoComponent") }}

## Image background

To make an image background, pass an object to the `[background]` input according to `ImageBackground` interface

The image lies at the origin of the flow and moves and zooms with it, unless `fixed` is set. In the example it is a
floor plan at its natural size, so the positions of the nodes are positions on the plan.

{{ NgDocActions.demoPane("ImageCustomBackgroundDemoComponent") }}

## Grid pattern

To make grid pattern, pass an object to the `[background]` input according to `GridBackground` interface

{{ NgDocActions.demoPane("GridCustomBackgroundDemoComponent") }}
