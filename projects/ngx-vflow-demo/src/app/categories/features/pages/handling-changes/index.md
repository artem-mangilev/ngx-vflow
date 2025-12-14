# {{ NgDocPage.title }}

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

Where:

```ts
type NodeChangeType = 'position' | 'add' | 'remove' | 'select';

type EdgeChangeType = 'detached' | 'add' | 'remove' | 'select';
```

{{ NgDocActions.demoPane("HandlingChangesFilteredDemoComponent") }}

List of all possible filter outputs:

```
'onNodesChange.position',
'onNodesChange.size',
'onNodesChange.add',
'onNodesChange.remove',
'onNodesChange.select',

'onEdgesChange.detached',
'onEdgesChange.add',
'onEdgesChange.remove',
'onEdgesChange.select',
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
