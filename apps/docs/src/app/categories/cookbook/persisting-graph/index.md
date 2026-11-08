A graph is application-owned data, and the library never asks where it comes from or where it goes. Saving it to a store, a server or `localStorage` takes two steps the library provides: the graph as plain objects, and the objects back as a graph.

## The plain shape

`Node` and `Edge` hold their interactive properties in signals, and `JSON.stringify` drops functions, so a node object loses its point, data and size on the way out. `toStaticNodes()` and `toStaticEdges()` read every signal once and return `StaticNode` and `StaticEdge` objects: the shape `createNodes()` and `createEdges()` take. A field without a signal stays absent, so a content-sized node is saved without a size and stays content-sized when it comes back.

```typescript
import { createEdges, createNodes, toStaticEdges, toStaticNodes } from 'ngx-vflow';

const saved = JSON.stringify({ nodes: toStaticNodes(this.nodes()), edges: toStaticEdges(this.edges()) });

const { nodes, edges } = JSON.parse(saved);
this.nodes.set(createNodes(nodes));
this.edges.set(createEdges(edges));
```

The functions read without tracking, so a snapshot taken inside an `effect` does not make the effect follow every node.

## Keys instead of functions

Three fields can hold a function, and JSON drops each of them. Register the function once with `provideVflow()` and name the key in the data instead:

| Field            | Register with                            | Name in the data    |
| ---------------- | ---------------------------------------- | ------------------- |
| `Node.component` | `withNodeComponents({ task: TaskNode })` | `component: 'task'` |
| `Edge.component` | `withEdgeComponents({ link: LinkEdge })` | `component: 'link'` |
| `Edge.curve`     | `withCurves({ avoid: avoidNodesCurve })` | `curve: 'avoid'`    |

A development build warns when a snapshot holds a class, a factory or a curve function. Keep `data` JSON-friendly as well: it belongs to you, and the library neither reads nor checks it.

## What not to save

A `size` change with `mode: 'auto'` on an axis is a measurement of the content, not data; see [Resizer](../../nodes/resizer). Snapshots respect this on their own, since an `auto` axis has no signal, but code that copies sizes from `nodesChanges.size` into the nodes must skip `auto` axes.

## Example

Drag the nodes and save, then reload the page: the demo restores the graph from `localStorage` when it loads, so it comes back as you left it. The snapshot is printed next to the flow as it is saved.

{{ NgDocActions.demoPane("PersistingGraphDemoComponent") }}
