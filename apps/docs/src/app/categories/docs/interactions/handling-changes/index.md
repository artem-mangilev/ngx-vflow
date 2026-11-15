---
keyword: 'FeaturesHandlingChanges'
---

This guide shows how to react when the flow changes a node or an edge: a node was dragged, resized or selected, an
edge was selected or lost an end. The demos report the changes in toasts.

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
from your collection, handle `(edgesChanges.detached)`, or read the `detachedEdges` signal of the flow. Removing a
node with `removeElements()` removes its edges with it, so nothing is left detached. This change type is
experimental.

## Change types

| Output                    | Emitted when                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `(nodesChanges.position)` | A node was moved by a drag or the keyboard                                                                                                                     |
| `(nodesChanges.size)`     | The rendered size of a node changed; `mode` tells for each axis whether it is `explicit` or an `auto` measurement, see [Node sizes](/docs/concepts/node-sizes) |
| `(nodesChanges.select)`   | A node was selected or deselected                                                                                                                              |
| `(edgesChanges.select)`   | An edge was selected or deselected                                                                                                                             |
| `(edgesChanges.detached)` | An edge stopped being drawn because an end is missing                                                                                                          |

Do not replay these notifications through the [graph operations](/docs/graph/graph-operations): the change has
already happened.

## See also

- [Core concepts](/docs/concepts/core-concepts#what-the-flow-writes) for which signals of a node or an edge the flow
  writes, and which it only reads.
- [Resizing](/docs/nodes/resizer#save-the-size-a-user-set) for saving a size from a `size` change.
