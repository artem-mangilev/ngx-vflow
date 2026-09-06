This topic needs some clarification due to the design decisions behind the library.

The library renders the flow with coordinated HTML and SVG layers:

- **HTML (with CSS)** renders nodes, group-node templates, handles, labels, toolbars, and resize controls in a transformed viewport.
- **SVG** renders edges and connection overlays. Each edge retains its own SVG root so edge and node `z-index` values can interleave.

With virtualization enabled, offscreen views stay mounted and use `display: none`. Initial measurement and active interactions temporarily keep nodes in layout.

Zooming and panning transform the shared viewport, keeping its HTML and SVG content in the same flow coordinate system.

Documented Angular APIs, CSS classes, and observable behavior are supported contracts. The exact private DOM structure and nesting of these layers are implementation details and can change between releases.
