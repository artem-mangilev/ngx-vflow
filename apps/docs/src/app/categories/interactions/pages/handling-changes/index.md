---
keyword: 'FeaturesHandlingChanges'
---

> **Info**
> You can observe changes in the toasts.

You can observe various changes in nodes and edges. Every `NodeChange` and `EdgeChange` is a post-mutation notification: the collection or writable signal has already changed. Do not replay these notifications through structural graph helpers.

Types of `NodeChange`s:

- `position` - new node position after drag and drop
- `size` - new rendered node size; `mode` tells for each axis (`{ width, height }`) whether it is `explicit` (set by the application or the resizer, worth persisting) or an `auto` measurement of the node's content
- `add` - when node was created
- `remove` - when node was removed
- `select` - when node was selected (also triggers for unselected nodes)

Types of `EdgeChange`s:

- `add` - when edge was created
- `remove` - when edge was removed
- `select` - when edge was selected (also triggers for unselected edges)
- `detached` - when edge became invisible due to the absence of the source or target node. Use this to delete such edges from the edges list

There are a several ways to receive these changes:

## From (nodesChanges) and (edgesChanges) outputs

This is a way to get every possible change. Changes come as non-empty arrays:

- `(nodesChanges)` emits `NodeChange[]`
- `(edgesChanges)` emits `EdgeChange[]`

One array holds every change of one tick. Dragging ten selected nodes emits one array with ten `position` changes on every move, not ten arrays.

{{ NgDocActions.demoPane("HandlingChangesDemoComponent") }}

## From filtered outputs

For your convenience, here is the filtering scheme for changes based on the `(nodesChanges)` and `(edgesChanges)` events:

- `(nodesChanges.[NodeChangeType])` - a list of node changes of a certain type
- `(edgesChanges.[EdgeChangeType])` - a list of edge changes of a certain type

Where:

```ts
type NodeChangeType = 'position' | 'size' | 'add' | 'remove' | 'select';

type EdgeChangeType = 'detached' | 'add' | 'remove' | 'select';
```

{{ NgDocActions.demoPane("HandlingChangesFilteredDemoComponent") }}

List of all possible filter outputs:

```
'nodesChanges.position',
'nodesChanges.size',
'nodesChanges.add',
'nodesChanges.remove',
'nodesChanges.select',

'edgesChanges.detached',
'edgesChanges.add',
'edgesChanges.remove',
'edgesChanges.select',
```

A filtered output also emits one array per tick, with the changes of its type only. It observes only what its type needs, so prefer it when you handle a single type.

## From the component itself

`nodesChanges` and `edgesChanges` are outputs of `VflowComponent`, so code can subscribe to them through a reference to the flow. The subscription ends when the flow is destroyed.

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

For RxJS operators, wrap an output with `outputToObservable(this.vflow.nodesChanges)` from `@angular/core/rxjs-interop`. The filtered outputs are available only in the template.

## Which signals the flow writes

Most signals of a `Node` are optional, and they are of three kinds:

- **The flow writes them**: `point`, `selected`, and `width` / `height` (only a resize gesture). With the signal in the node, the flow writes into it. Without `selected` or a size signal, the flow holds the value itself, and the change is the way to learn it.
- **The flow only reads them**: `draggable`, `extent`, `parentId`, `data`, `selectable`, `focusable`, `ariaLabel`, `ariaDescription`, `domAttributes`. A missing signal means the default or the setting of the flow.
- **`width` / `height` also choose the size mode**: an axis with the signal is `explicit`, an axis without it follows the content.

Edges follow the same rule. The flow writes only `selected`; it only reads `curve`, `markers`, `reconnectable`, `interactionWidth`, `data`, `selectable`, `focusable`, `ariaLabel`, `ariaDescription` and `domAttributes`.

The flow never adds signals to your node and edge objects. You can add one to an existing object later: assign it and pass a new array, and the flow reads it without recreating the node or the edge. A signal of the application wins over the value the flow held.

```ts
node.selected = signal(true);
this.nodes.update((nodes) => [...nodes]);
```
