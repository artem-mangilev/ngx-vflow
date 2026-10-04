## Disabling

You can disable `draggable` behavior on certain `Node` by passing `false`.

{{ NgDocActions.demoPane("DraggablesDemoComponent") }}

## Drag handle

You can restrict dragging to a specific part of node, by adding `vDragHandle` directive to this element. It's important to note that if a node contains at least one `vDragHandle`, it can only be dragged from those specific areas where `vDragHandle` was added. Otherwise, the entire node can be dragged, provided the `draggable` property is set to `true`.

{{ NgDocActions.demoPane("DragHandleDemoComponent") }}
