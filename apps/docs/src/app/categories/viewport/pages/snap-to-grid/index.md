You can snap nodes to the grid by passing the `snapGrid` input to the `VflowComponent`

The grid lies in flow space, like the background: a nested node snaps to the same cells as a top-level one, whatever the position of its parent. Keyboard moves snap the same way.

{{ NgDocActions.demoPane("SubflowsDemoComponent") }}
