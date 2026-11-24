Copy the selected nodes and paste them as new ones. Select nodes with a click, `Mod`-click or the selection box
(drag with `Shift`), then press Copy and Paste, or `Mod+C`, `Mod+V` and `Mod+D` to duplicate, while focus is inside
the demo.

{{ NgDocActions.demoPane("CopyPasteDemoComponent") }}

- Copy reads the selection from the `selected` signal of each node and keeps the nodes with `toStaticNodes()`. An
  edge is copied only when both of its ends are.
- Paste gives every node and edge a new id, maps the edges onto the new ids, and moves the nodes by an offset that
  grows with each paste. `addNodes()` and `addEdges()` append them.
- The pasted nodes become the selection, so they can be moved, copied or deleted right away.

The clipboard of the example lives in the component. To paste into another tab or another application, write the
same plain objects as JSON with `navigator.clipboard.writeText()` and read them back in a `paste` listener.
