# Render node-facing templates as native HTML

Version 3 renders nodes, group-node templates, handles, labels, toolbars, and resize controls as native HTML instead of SVG `foreignObject` content. Their public template contracts are explicitly HTML-only, but the existing `groupNode`, handle `[template]`, and `[resizable]` API names are retained. The migration guide must call out that SVG content passed through those APIs is no longer supported. The library positions the handle wrapper, so an HTML handle template context does not expose the former SVG placement `point`.

Edges remain individual SVG roots inside the transformed HTML viewport so edges and nodes can interleave through CSS `z-index`. This trade-off is retained until a focused paint/zoom benchmark demonstrates that another structure preserves interleaving with better runtime behavior.
