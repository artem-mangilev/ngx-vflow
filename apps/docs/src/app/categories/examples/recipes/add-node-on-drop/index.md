Drag a connection from a handle and release it over the empty canvas: a new node appears under the pointer, already
connected. Released on a handle, the connection is an ordinary edge.

{{ NgDocActions.demoPane("AddNodeOnDropDemoComponent") }}

- `(connectEnd)` reports every end of a connection gesture. Released anywhere but on a handle, its `to` is `null`
  and `point` is where the pointer was, in flow space.
- The new node takes the role the gesture leaves open: dragged out of a source handle it becomes the target, dragged
  out of a target handle it becomes the source. The example places it so that its free handle lies under the pointer.
- A release on a handle emits `(connect)` too, and the example adds the edge there; `(connectEnd)` then only reports
  it, so the node is created only when `to` is `null`.
