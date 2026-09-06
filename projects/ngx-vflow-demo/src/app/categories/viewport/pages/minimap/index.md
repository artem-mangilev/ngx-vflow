The library includes a minimap that offers an overview of the entire flow. To enable it, simply add a `<mini-map />` component as a direct child of `<vflow />`. For customization options, see the available inputs in `MiniMapComponent`.

The minimap uses canvas and caches node previews during pan and zoom. It updates the previews when node geometry or selection changes, and keeps the image sharp on high-DPI displays.

Planned enhancements for the minimap:

- Develop an API to customize mini-node appearance (e.g., color, stroke)
- Enable panning and zooming within the minimap

{{ NgDocActions.demoPane("MinimapDemoComponent") }}
