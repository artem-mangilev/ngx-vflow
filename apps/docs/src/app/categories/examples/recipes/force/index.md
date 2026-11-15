---
keyword: 'WorkshopsLayoutForce'
---

A force-directed graph with the [d3-force](https://github.com/d3/d3-force) adapter of `*PackagesLayout`, here a service and the services it calls. The layout is continuous: the simulation moves the cards on every tick, a dragged card is pinned under the pointer and reheats it, and a new link distance starts a new simulation from where the cards are.

The cards keep apart by their size, and each carries one floating handle, so a straight edge meets the side of a card that faces its other end. The simulation gathers the graph around its `center` and never ends, so there is no moment to fit the view at: the demo centers the view there once.

{{ NgDocActions.demoPane("ForceLayoutDemoComponent") }}
