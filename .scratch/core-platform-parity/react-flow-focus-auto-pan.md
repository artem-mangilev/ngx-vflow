# React Flow focus auto-pan

Checked 2026-09-05 by inspecting official documentation and source. Source links are pinned to upstream HEAD `0a1f9575b25679f2880175de8d3eae21aedde921`, resolved with `git ls-remote`. No browser/runtime tests were performed.

## Findings for issue 10, Q9

- `autoPanOnNodeFocus` defaults to `true`; it is separate from `autoPanOnNodeDrag`. [ReactFlow API](https://reactflow.dev/api-reference/react-flow#autopanonnodefocus)
- Focus panning runs only when keyboard accessibility is enabled, the node wrapper matches `:focus-visible`, and `autoPanOnNodeFocus` is enabled. It requests centering only when the visibility helper excludes the node. The request preserves the current zoom; it has no padding or duration option. [NodeWrapper](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx#L151-L168)
- For ordinary initialized nodes with positive dimensions, any positive overlap with the viewport counts as visible. Therefore a partly clipped node does not trigger panning. The same rule covers oversized nodes; there is no separate oversized-node policy. Caveat: the helper also includes nodes without handle bounds, dragging nodes, and zero-area nodes independently of positive overlap. [getNodesInside](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/graph.ts#L249-L286)
- The target is placed at the viewport center, rather than moved just enough to become visible. Store `setCenter` calculates the translation and calls `panZoom.setViewport`. [Store](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/store/index.ts#L390-L405)
- This focus path is immediate: omitted duration becomes `0`, which returns the D3 selection without a transition. [getD3Transition](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/xypanzoom/utils.ts#L24-L31)
- This path does not constrain the target to `translateExtent`: `setViewport` calls `setTransform` directly, unlike `setViewportConstrained`; D3 `zoom.transform` does not enforce scale or translate extents. [XYPanZoom](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/xypanzoom/XYPanZoom.ts#L218-L237), [D3 contract](https://d3js.org/d3-zoom#zoom_transform)
- Built-in edges have no corresponding focus-pan handler. [EdgeWrapper](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/EdgeWrapper/index.tsx#L169-L202)
- Arrow-key movement updates node positions without requesting viewport movement; the inspected built-in path does not continuously keep a moved node visible. [useMoveSelectedNodes](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/hooks/useMoveSelectedNodes.ts#L15-L63)

## Implementation caveat

The visibility check uses `internals.positionAbsolute`, but the focus handler computes its center from `node.position + size / 2`. For nested nodes or a non-default origin these coordinate choices can differ. This is a source-level discrepancy, not a reproduced React Flow bug; ngx-vflow should use its own absolute node bounds if adopting the behavior. [Visibility coordinates](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/system/src/utils/graph.ts#L271-L274), [Center coordinates](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx#L164-L167)

## Decision implication

React Flow parity would mean: focus a completely off-screen node → immediately center it at unchanged zoom; retain partially visible nodes as-is; expose a separate enabled-by-default switch. Padding, minimal translation, edge centering, and following keyboard movement would be additional ngx-vflow product decisions. Q9 remains open pending the user's choice.

## Movement steps (Q12)

- Without snapping, each arrow press adds `5` flow-coordinate units along the selected axis; with snapping it adds the corresponding `snapGrid` cell dimension. These are graph coordinates, not fixed screen pixels: the delta is added directly to `positionAbsolute` without zoom compensation. [useMoveSelectedNodes](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/hooks/useMoveSelectedNodes.ts#L25-L38)
- `Shift` supplies a fixed multiplier of `4`: therefore `20` flow units, or four grid cells. [NodeWrapper](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx#L145-L148)
- With snapping, the proposed position is passed through `snapPosition`; an initially off-grid node may consequently move by a different actual distance as it aligns to the grid. [Movement snapping](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/hooks/useMoveSelectedNodes.ts#L35-L42)
- The inspected `ReactFlowProps` interface exposes `snapToGrid`, `snapGrid`, and `disableKeyboardA11y`, but no dedicated keyboard movement step or multiplier option. The built-in `5` and `4` constants are implementation choices. [Public props](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/types/component-props.ts)
