## Auto size

`vflow` automatically fits it container if you pass `view="auto"` input

{{ NgDocActions.demo("ViewSizeFullscreenDemoComponent", { fullscreenRoute: "view-size-auto" }) }}

## Fixed size

`vflow` can take fixed space if you pass `[view]="[600, 600]"` input, where first item of array is width (in pixels), and the second is height (in pixels).

{{ NgDocActions.demo("ViewSizeFixedDemoComponent", { fullscreenRoute: "view-size-fixed" }) }}
