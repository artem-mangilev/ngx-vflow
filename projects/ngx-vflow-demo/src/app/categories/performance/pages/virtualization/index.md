> **Warning**
> This is an experimental API. The library still does not support edge previews - only node previews are available.

The library supports **virtualization**, which helps improve performance when rendering large numbers of nodes. When virtualization is enabled, an additional `canvas` layer is activated alongside the native HTML viewport and SVG edge layers.

Nodes outside the viewport are removed from the HTML layer. Edges whose path bounds are outside the viewport are also removed, while paths crossing the viewport remain eligible even when both endpoint nodes are outside it. Previously measured handles retain their geometry while their node is virtualized.

To enable virtualization, set the `virtualization` flag in the `Optimization` interface. Below `virtualizationZoomThreshold`, only canvas node previews are shown; interactive nodes and SVG edges are hidden. Zooming back above the threshold restores the visible entities.

> **Info**
> It's important to note that a preview node is a simplified version of a real node. It is rendered on the canvas layer,
> is **not interactive**, and may not visually match the real node exactly (at least for now) — hence the name _preview_.
>
> However, the library aims to provide a good API for customizing these previews.
> The `NodePreview` interface allows you to style preview nodes using a subset of `CSSStyleDeclaration`, letting you write familiar, declarative CSS instead of low-level canvas code.
> The library automatically compiles these styles into appropriate `canvas` calls.

To customize the preview for a specific node, use the `preview` property available on `Node`.

{{ NgDocActions.demoPane("VirtualizationDemoComponent") }}
