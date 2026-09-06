Enable viewport virtualization with `[optimization]="{ virtualization: true }"`.

Nodes and edges outside the viewport use `display: none`. Their DOM and Angular components remain mounted, so local component state survives panning away and back. Nodes and edges keep their original appearance at every zoom; there is no canvas preview layer.

New nodes are loaded and measured even outside the viewport. Until their dimensions and handles are ready, they use `visibility: hidden`. Last measured geometry is retained while CSS-hidden and refreshed when layout is restored. Virtualization therefore takes precedence over `lazyLoadTrigger: 'viewport'`.

Edges are checked by their path bounds, so a path crossing the viewport can remain visible even when both endpoint nodes are outside it. Node toolbars and edge labels follow their owner's visibility. Focused nodes, toolbars and edge labels remain in layout; node dragging (including the dragged group), resizing and connection gestures also retain their participating nodes. Selection alone does not prevent culling.

Viewport geometry is checked in shared passes; only changes in viewport membership notify entity views. Camera transforms and CSS culling are applied independently of the graph list template.

This reduces layout and paint work for hidden content. It does not release DOM memory, stop subscriptions or component effects, or avoid initial component creation. When the entire graph fits in the viewport, all its visible content still needs to be drawn.

While a node is CSS-hidden, its cached dimensions may become stale if its custom content changes size. The library refreshes them on return; it cannot continuously measure content excluded from layout. Keep geometry in application-owned state when offscreen layout must remain exact.

`virtualizationZoomThreshold`, `NodePreview` and the node’s `preview` property are deprecated and ignored; existing code may retain these fields while migrating.

{{ NgDocActions.demoPane("VirtualizationDemoComponent") }}
