You're able to select a background pattern for your flow.

## Canvas color

The canvas color is CSS: set the `--vflow-background` token on the `vflow` element or any ancestor. Pattern
colors (dots, grid) follow `--vflow-muted`; the `.vflow-background-pattern` class is the public selector
for finer control.

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
