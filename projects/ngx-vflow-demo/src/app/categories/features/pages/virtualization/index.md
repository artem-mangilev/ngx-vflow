> **Warning**
> This is an experimental API. The library still does not support edge previews - only node previews are available.

The library supports **virtualization**, which helps improve performance when rendering large numbers of nodes. When virtualization is enabled, an additional `canvas` layer is activated alongside the existing `SVG` layer.

During viewport changes (zoom/pan), the canvas layer quickly renders lightweight **preview nodes** to ensure smooth interaction. Once the interaction ends, these preview nodes are **hydrated** into full-featured, heavy **SVG nodes**.

To enable virtualization, set the `virtualization` flag in the `Optimization` interface. Additionally, you can use the `virtualizationZoomThreshold` property to specify the minimum zoom level at which previews should be rendered. This helps avoid performance issues by rendering a lot of real `SVG` nodes.

> **Info**
> It's important to note that a preview node is a simplified version of a real node. It is rendered on the canvas layer,
> is **not interactive**, and may not visually match the real node exactly (at least for now) — hence the name _preview_.
>
> However, the library aims to provide a good API for customizing these previews.
> The `NodePreview` interface allows you to style preview nodes using a subset of `CSSStyleDeclaration`, letting you write familiar, declarative CSS instead of low-level canvas code.
> The library automatically compiles these styles into appropriate `canvas` calls.

To customize the preview for a specific node, use the `preview` property available on both `Node` and `DynamicNode`.

{{ NgDocActions.demoPane("VirtualizationDemoComponent") }}
