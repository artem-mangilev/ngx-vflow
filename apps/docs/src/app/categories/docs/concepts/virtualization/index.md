Virtualization is the usual answer to a large list: render what is visible and drop the rest. A flow cannot quite
do that, and this page explains what it does instead, what that saves, and what it leaves for you.

## Hidden, not destroyed

Nodes and edges outside the viewport use `display: none`. Their DOM and Angular components remain mounted, so local component state survives panning away and back. Nodes and edges keep their original appearance at every zoom; there is no canvas preview layer.

Destroying offscreen nodes would release memory, but a node is your component: it may hold a draft the user typed,
a subscription, a chart that took a second to build. Keeping the view and taking it out of layout gives up the
memory saving and keeps panning cheap and lossless.

## A node has to be measured once

New nodes are loaded and measured even outside the viewport. Until their dimensions and handles are ready, they use `visibility: hidden`. Last measured geometry is retained while CSS-hidden and refreshed when layout is restored. Virtualization therefore takes precedence over `lazyLoadTrigger: 'viewport'`.

The reason is that edges need the geometry of both ends. An edge between a visible node and one that was never
rendered could not be drawn at all.

## What stays visible

Edges are checked by their path bounds, so a path crossing the viewport can remain visible even when both endpoint nodes are outside it. Node toolbars and edge labels follow their owner's visibility. Focused nodes, toolbars and edge labels remain in layout; node dragging (including the dragged group), resizing and connection gestures also retain their participating nodes. Selection alone does not prevent culling.

## The cost of a viewport change

Viewport membership comes from a spatial index, so a viewport change costs the entities near the viewport rather than a scan of the graph, and only membership changes notify entity views. Entities entering the viewport are shown at once. Entities that a pan or zoom moves out of view are hidden when the gesture ends, or after a short pause in the motion, so that a gesture in progress spends no style work on content that is already offscreen. Camera transforms and CSS culling are applied independently of the graph list template.

## What it saves and what it does not

This reduces layout and paint work for hidden content. It does not release DOM memory, stop subscriptions or component effects, or avoid initial component creation. When the entire graph fits in the viewport, all its visible content still needs to be drawn.

What remains is the raster cost of the visible content. On every zoom step, and on every pan of the non-composited viewport, the browser rasterizes every visible node again at the device pixel ratio, on the GPU. Styles that need a blur, such as `box-shadow` with a blur radius or `filter`, dominate that cost: on a 1000×900 pane at a device pixel ratio of 2 with 154 visible nodes, a `0 3px 10px` shadow on each node alone made zooming out drop 30 of 74 frames and the following pan 20 of 250, while without the blur both ran at the display's frame rate. Prefer borders or blur-free shadows for the resting state of a node and keep blurred effects for hover and selection.

## Sizes can go stale

While a node is CSS-hidden, its cached dimensions may become stale if its custom content changes size. The library refreshes them on return; it cannot continuously measure content excluded from layout. Keep geometry in application-owned state when offscreen layout must remain exact.

## See also

- [Virtualization](/docs/performance/virtualization) to turn it on.
- [Lazy loading](/docs/performance/lazy-loading) to delay loading the code of node components.
