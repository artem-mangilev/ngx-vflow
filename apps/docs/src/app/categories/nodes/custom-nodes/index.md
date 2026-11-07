---
keyword: 'FeaturesCustomNodes'
---

This is where things become a lot more interesting. You can create custom nodes with HTML and CSS.

Custom node content is rendered as native HTML in the transformed flow viewport, so regular HTML layout and CSS rules apply.

## Template nodes

You can create custom nodes with a `vNode` template

Follow these steps to achieve this:

1. Put an element with the structural `vNode` directive inside `vflow`, as in the example below
2. Write your HTML inside this element
3. Pass any data with the `data` field of the node and read it inside the template through `ctx.data()`

{% raw %}

```html
<vflow [nodes]="nodes" [edges]="edges">
  <div *vNode="let ctx" class="node">{{ ctx.data().text }}</div>
</vflow>
```

{% endraw %}

The structural form is short for `<ng-template let-ctx vNode>`. Use the long form when the template has no single root
element, for example when it starts with `@if` or `@switch`.

A template cannot take a type argument, so `ctx` is a `NodeRef<any>` by default. To type `ctx.data()`, name the nodes
the template renders with `of`; the flow never reads this input, it only tells the type checker the data type:

{% raw %}

```html
<div *vNode="let ctx; of: nodes" class="node">{{ ctx.data().text }}</div>
<ng-template let-ctx vNode [vNodeOf]="nodes">…</ng-template>
```

{% endraw %}

Every node without `component` renders through this template. The library does not read a node kind: if your flow has
several kinds of nodes, keep a discriminator in `data` and branch on it with `@if` or `@switch` in the template.

{{ NgDocActions.demoPane("CustomNodesDemoComponent") }}

## Component nodes

Another approach is to render nodes from components.

Its benefits:

- type-safe node data access
- good for complex flows with many different node types

How to create component node:

1. Create a regular angular standalone component. It does not extend any base class
2. Read the node with `injectNode()`. Pass your data interface to its generic to get typed `data`. The returned object
   is the same one a `vNode` template receives as `ctx`: `data`, `selected`, `preselected`, `width`, `height` and
   the node itself
3. Put your component in the `component` field of `Node`. The library will render your node for you

Nodes of different components usually carry different data. `createNodes()` without a type argument types the result
with the union of their data types, so the nodes need no shared data type or discriminator: each component reads its
own data through `injectNode<T>()`.

A lazy import function in `component` loads the component only when it is needed; see the Lazy loading page.

{{ NgDocActions.demoPane("CustomComponentNodesDemoComponent") }}

### Handling events

> **Warning**
> This is an experimental API

There is a `(componentNodeEvent)` event on `VflowComponent`. Here is how it works:

1. It subscribes to every output declared by every component node of your flow: `@Output()`, `output()` and
   `outputFromObservable()`
2. It emits on every emit of those outputs and stops listening when the node is destroyed

The event carries the node, the component class and the output:

```ts
export interface AnyComponentNodeEvent {
  nodeId: string; // Id of the node where the event occurs
  component: Type<unknown>; // The component class that emitted it
  eventName: string; // Property name of the output
  eventPayload: unknown;
}
```

`isComponentNodeEvent(event, Cmp)` checks the component class and narrows the event to `ComponentNodeEvent<[Cmp]>`: the
union of the outputs of that class, where `eventName` is one of their names and `eventPayload` has its type.

```ts
  ...

  handleComponentEvent(event: AnyComponentNodeEvent) {
    if (isComponentNodeEvent(event, RedSquareNodeComponent) && event.eventName === 'redSquareEvent') {
      console.log(event.eventPayload)
    }

    if (isComponentNodeEvent(event, BlueSquareNodeComponent) && event.eventName === 'blueSquareEvent') {
      console.log(event.eventPayload.x + event.eventPayload.y)
    }
  }

  ..
```

Only public outputs appear in the narrowed type; a `protected` output is forwarded at runtime all the same.
