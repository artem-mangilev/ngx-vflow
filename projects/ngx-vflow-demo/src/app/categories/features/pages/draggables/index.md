# {{ NgDocPage.title }}

## Disabling

You can disable `draggable` behavior on certain `Node` or `DynamicNode` by passing `false`.

{{ NgDocActions.demoPane("DraggablesDemoComponent") }}

## Drag handle

You can restrict dragging to a specific part of node, by adding `dragHandle` directive to this element. It's important to note that if a node contains at least one `dragHandle`, it can only be dragged from those specific areas where `dragHandle` was added. Otherwise, the entire node can be dragged, provided the `draggable` property is set to `true`.

{{ NgDocActions.demoPane("DragHandleDemoComponent") }}
