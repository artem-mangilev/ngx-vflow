Selection box allows selecting multiple nodes and edges by dragging over the canvas.

# Activation

Hold `Shift` (default `selection` shortcut) and drag on empty canvas space to start box selection.

If you need to remap this shortcut, see [Keyboard shortcuts](../keyboard-shortcuts).

# Configuration

Use the `[selectionBox]` input:

```typescript
selectionBox: SelectionBoxSettings = {
  mode: 'full',
  color: '#ff8a65',
};
```

- `mode: 'full'` selects only entities fully enclosed by the box.
- `mode: 'partial'` selects entities that intersect the box.
- `color` controls selection box stroke/fill color.

# Selection semantics

- During drag, entities are marked as preselected.
- On pointer release, preselected entities become selected.
- If `multiSelection` is not active, previous selection is cleared before applying box selection results.
- For edges, `full`/`partial` checks are based on source/target handle points, not by edge curve path intersection.

# Template state access

The `preselected` state is also exposed in rendering contexts, so custom templates can style the drag-preview state differently from the final selected state.

- Node template contexts expose `preselected` together with `selected`.
- The base custom node class `CustomNodeComponent` exposes the `preselected` signal for component-based custom nodes.
- Edge template context also exposes `preselected`, so custom edges can render preselection state explicitly.

In this demo, switch between `full` and `partial`, then hold `Shift` and drag over partially overlapping nodes and edge endpoints.

{{ NgDocActions.demoPane("SelectionBoxDemoComponent") }}
