# {{ NgDocPage.title }}

The library includes a minimap that offers an overview of the entire flow. To enable it, simply add a `<mini-map />` component as a direct child of `<vflow />`. For customization options, see the available inputs in `MiniMapComponent`.

Planned enhancements for the minimap:

- Develop an API to customize mini-node appearance (e.g., color, stroke)
- Enable panning and zooming within the minimap
- Render mini-nodes to visually match main nodes, using a simplified DOM structure to optimize performance


{{ NgDocActions.demoPane("MinimapDemoComponent") }}

