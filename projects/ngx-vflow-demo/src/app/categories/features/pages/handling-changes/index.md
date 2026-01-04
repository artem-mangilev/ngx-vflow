---
keyword: `FeaturesHandlingChanges`
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

## From (onNodesChange) and (onEdgesChange) outputs

This is a way to get every possible change. Changes came as non empty arrays:

- `(onNodesChange)` emits `NodeChange[]`
- `(onEdgesChange)` emits `EdgeChange[]`

{{ NgDocActions.demoPane("HandlingChangesDemoComponent") }}

## From filtered outputs

For your convenience, here is the filtering scheme for changes based on the `(onNodesChange)` and `(onEdgesChange)` events:

- `(onNodesChange.[NodeChangeType])` - a list of node changes of a certain type
- `(onNodesChange.[EdgeChangeType])` - a list of edge changes of a certain type
- `(onNodesChange.[NodeChangeType].[Count])` - a list (`many`) or single (`single`) node change of a certain type
- `(onEdgesChange.[EdgeChangeType].[Count])` - a list (`many`) or single (`single`) edge change of a certain type

Where:

```ts
type NodeChangeType = 'position' | 'add' | 'remove' | 'select';

type EdgeChangeType = 'detached' | 'add' | 'remove' | 'select';

// single - when there is only one change of this type (for example if you drag and drop some node, it's consireder as single change)
// many - when there is more than one change of this type (for example if you deleted several nodes at the same time)
type Count = 'single' | 'many';
```

{{ NgDocActions.demoPane("HandlingChangesFilteredDemoComponent") }}

List of all possible filter outputs:

```
'onNodesChange.position',
'onNodesChange.position.single',
'onNodesChange.position.many',
'onNodesChange.size',
'onNodesChange.size.single',
'onNodesChange.size.many',
'onNodesChange.add',
'onNodesChange.add.single',
'onNodesChange.add.many',
'onNodesChange.remove',
'onNodesChange.remove.single',
'onNodesChange.remove.many',
'onNodesChange.select',
'onNodesChange.select.single',
'onNodesChange.select.many',

'onEdgesChange.detached',
'onEdgesChange.detached.single',
'onEdgesChange.detached.many',
'onEdgesChange.add',
'onEdgesChange.add.single',
'onEdgesChange.add.many',
'onEdgesChange.remove',
'onEdgesChange.remove.single',
'onEdgesChange.remove.many',
'onEdgesChange.select',
'onEdgesChange.select.single',
'onEdgesChange.select.many',
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
