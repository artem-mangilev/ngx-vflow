# {{ NgDocPage.title }}

> **Info**
> You can't mix `Node` and `DynamicNode` in a single array so you have to choose what you want to use

For more complex scenarios, you might need to have a fine-grained control on specific nodes.

In such cases, you can use `DynamicNode`, which is essentially a `Node` with properties with same names but with a `WritableSignal` type. This offers the following benefits:

- Granular updates to specific nodes with efficient rendering (only the affected node is re-rendered).
- Access to the updated state of a node directly (without listening events). For instance, if a point changes due to drag-and-drop, the node's `point()` signal will reflect the new position.
- Additional benefits of signals, such as executing actions within an effect when a dynamic property changes.

> **Info**
> Not all properties of `DynamicNode` are `WritableSignal`, for instance an `id` must be static, so it remains of a regular `string` type

## Code example

If you want to change a node's position programmatically, you would:

```ts
...

public nodes: DynamicNode[] = [
  {
    type: 'default'
    id: '1',
    point: signal({ x: 100, y: 100 })
  }
]

updatePosition() {
  const [node] = this.nodes

  // The first node will move to new position
  node.point.set({ x: 150, y: 150 })
}

...

```
