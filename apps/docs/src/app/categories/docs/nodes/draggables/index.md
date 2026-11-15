Every node can be dragged by any point of its presentation. A node can opt out, or limit dragging to a part of itself.

## Disable dragging

Set `draggable` of a node to `false`.

{{ NgDocActions.demoPane("DraggablesDemoComponent") }}

## Drag handle

To drag a node only by a part of it, put the `vDragHandle` directive on that element. A node with at least one `vDragHandle` is dragged from those elements only. To keep an embedded control from starting a drag, mark it with `vNoDrag`.

In the example the header of a card is its drag handle, and the checkbox inside the header is marked with `vNoDrag`.

{{ NgDocActions.demoPane("DragHandleDemoComponent") }}
