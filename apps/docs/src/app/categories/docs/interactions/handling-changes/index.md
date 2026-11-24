---
keyword: 'FeaturesHandlingChanges'
---

This guide shows how to react when the flow changes a node or an edge: a node was dragged, resized or selected, an
edge was selected or lost an end. The demos print, under the flow, the last array each
output emitted; click an edge to select it, or connect two nodes to add one.

A change is a notification after the fact: the signal of the node or edge has already been written. Adding and
removing nodes and edges is not reported, because your application makes those changes itself.

## Listen to every change

Bind `(nodesChanges)` and `(edgesChanges)`. Each emits a non-empty array with every change of one tick, so dragging
ten selected nodes emits one array with ten `position` changes on every move, not ten arrays.

{{ NgDocActions.demoPane("HandlingChangesDemoComponent") }}

## Listen to one type of change

If you handle a single type, bind its filtered output. It emits only the changes of that type, and observes only
what that type needs:

```html
<vflow [nodes]="nodes" [edges]="edges" (nodesChanges.position)="save($event)" (edgesChanges.detached)="prune($event)" />
```

{{ NgDocActions.demoPane("HandlingChangesFilteredDemoComponent") }}

## Subscribe from code

`nodesChanges` and `edgesChanges` are outputs of `VflowComponent`, so code with a reference to the flow can
subscribe to them. The subscription ends when the flow is destroyed. The filtered outputs are available only in the
template.

```ts
{
  ...
  @ViewChild(VflowComponent)
  vflow: VflowComponent

  ngAfterViewInit() {
    this.vflow.nodesChanges.subscribe((changes) => {
      // handle node changes
    })

    this.vflow.edgesChanges.subscribe((changes) => {
      // handle edges changes
    })
  }
  ...
}
```

To use RxJS operators, wrap an output with `outputToObservable(this.vflow.nodesChanges)` from
`@angular/core/rxjs-interop`.

## Remove edges that lost an end

An edge whose source or target node is absent, or whose handle is not rendered, is not drawn. To delete such edges
from your collection, handle `(edgesChanges.detached)`, or read the `detachedEdges` signal of the flow. An edge whose
nodes are not measured yet is not detached, so the edges a flow starts with are not reported while their handles are
being rendered. Removing a node with `removeElements()` removes its edges with it, so nothing is left detached.

## Change types

| Output                    | Emitted when                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `(nodesChanges.position)` | A node was moved by a drag or the keyboard                                                                                                             |
| `(nodesChanges.size)`     | The rendered size of a node changed; `mode` tells for each axis whether it is `explicit` or an `auto` measurement, see [Resizing](/docs/nodes/resizer) |
| `(nodesChanges.select)`   | A node was selected or deselected                                                                                                                      |
| `(edgesChanges.select)`   | An edge was selected or deselected                                                                                                                     |
| `(edgesChanges.detached)` | An edge stopped being drawn because an end is missing                                                                                                  |

Do not replay these notifications through the [graph operations](/docs/graph/graph-operations): the change has
already happened.

## What the flow writes

The flow writes into a few signals of a node: `point`, `selected`, and `width` / `height` after a resize gesture. With
the signal in the node, the flow writes into it; without `selected` or a size signal, the flow holds the value
itself, and the change above is the way to learn it. Every other signal of a node, `data`, `draggable`, `parentId`
and the rest, the flow only reads. Of an edge, the flow writes only `selected`.

The flow never adds signals to your objects. You can add one later: assign it and pass a new array, and the flow
reads it without recreating the node; a signal of the application wins over the value the flow held.

```ts
node.selected = signal(true);
this.nodes.update((nodes) => [...nodes]);
```

## See also

- [Resizing](/docs/nodes/resizer#save-the-size-a-user-set) for saving a size from a `size` change.
