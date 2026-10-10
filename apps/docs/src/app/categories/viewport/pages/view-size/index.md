## Auto size

By default, or with `view="auto"`, `vflow` fills its parent element, so the parent needs a width and a height of its own. In dev mode the flow warns when one of them measures zero.

{{ NgDocActions.demo("ViewSizeFullscreenDemoComponent", { fullscreenRoute: "view-size-auto" }) }}

## Fixed size

`vflow` can take fixed space if you pass `[view]="[600, 600]"` input, where first item of array is width (in pixels), and the second is height (in pixels).

{{ NgDocActions.demo("ViewSizeFixedDemoComponent", { fullscreenRoute: "view-size-fixed" }) }}
