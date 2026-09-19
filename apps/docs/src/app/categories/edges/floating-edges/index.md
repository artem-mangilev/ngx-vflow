The library supports floating edges. A floating edge is an edge that connects the closest handles of the source and target nodes. You can enable floating edges using the `floating` flag on `Edge`.

> **Info**
> Since the library always looks for the closest handles between nodes, there can only be one edge between any two nodes. Keep this in mind when building your flows.
>
> This limitation may be addressed in future releases.

{{ NgDocActions.demoPane("FloatingEdgesDemoComponent") }}

For edges that leave and enter nodes anywhere on their borders, without ports at all, see the Easy connect recipe in the cookbook: it combines a handle that covers the node with a curve built from `getFloatingEdgeParams`.
