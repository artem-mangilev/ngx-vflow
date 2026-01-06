---
keyword: 'FeaturesHandlingChanges'
---

> **Info**
> You can observe changes in the toasts.

You can observe various changes in nodes and edges.

Types of `NodeChange`s:

- `position` - new node position after drag and drop
- `size` - new node size
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

This is a way to get every possible change. Changes came as non empty arrays:

- `(nodesChanges)` emits `NodeChange[]`
- `(edgesChanges)` emits `EdgeChange[]`

{{ NgDocActions.demoPane("HandlingChangesDemoComponent") }}

## From filtered outputs

For your convenience, here is the filtering scheme for changes based on the `(nodesChanges)` and `(edgesChanges)` events:

- `(nodesChanges.[NodeChangeType])` - a list of node changes of a certain type
- `(nodesChanges.[EdgeChangeType])` - a list of edge changes of a certain type

Where:

```ts
type NodeChangeType = 'position' | 'add' | 'remove' | 'select';

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

## From componenet itself

```ts
{
  ...
  @ViewChild(VflowComponent)
  vflow: VflowComponent

  ngAfterViewInit() {
    this.vflow.nodesChange$.subscribe((changes) => {
      // handle node changes
    })

    this.vflow.edgesChange$.subscribe((changes) => {
      // handle edges changes
    })
  }
  ...
}
```
