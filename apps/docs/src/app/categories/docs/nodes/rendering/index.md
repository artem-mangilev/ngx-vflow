---
keyword: 'RenderingNodes'
---

Core is headless: it owns geometry, interaction and accessibility, and draws nothing of a node itself. Every node
renders through a presentation you provide, a `vNode` template or a component, as native HTML in the transformed
flow viewport, so regular HTML layout and CSS rules apply.

{{ NgDocActions.demoPane("DefaultNodesDemoComponent") }}

The demos of this documentation share a few small presentation components built on `@vflow/ui` (`docs-node` and
`docs-edge`), so each page can focus on its feature. Copy them or write your own.

## What a presentation receives

A template gets the node as `ctx`; a component gets the same object from `injectNode()`.

- `ctx.data()` is the `data` of the node, the only place for your own fields.
- `ctx.selected()` and `ctx.preselected()` follow the selection, see [Selection](/docs/interactions/selection).
- `ctx.width()` and `ctx.height()` are the rendered size. The optional `width` and `height` of a node are the size
  your application asks for; a node without them follows its content, see [Resizing](/docs/nodes/resizer).
- `ctx.node` is the node object itself.

`ariaLabel` gives a node its accessible name; without it core uses `Node {id}`. Handles are part of the presentation:
put the `vHandle` directive on the elements where connections attach, see [Handles](/docs/handles/handles).

## Draw nodes with a template

To draw nodes with a `vNode` template:

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

{{ NgDocActions.demoPane("TemplateNodesDemoComponent") }}

## Draw nodes with components

If a flow has several kinds of nodes, or you want typed access to the data of a node, draw each kind with its own
component:

1. Create a regular angular standalone component. It does not extend any base class
2. Read the node with `injectNode()`. Pass your data interface to its generic to get typed `data`. The returned object
   is the same one a `vNode` template receives as `ctx`: `data`, `selected`, `preselected`, `width`, `height` and
   the node itself
3. Put your component in the `component` field of `Node`. The library will render your node for you

Nodes of different components usually carry different data. `createNodes()` without a type argument types the result
with the union of their data types, so the nodes need no shared data type or discriminator: each component reads its
own data through `injectNode<T>()`.

A lazy import function in `component` loads the component only when it is needed; see [Lazy loading](/docs/performance/lazy-loading).

## Refer to components by key

The code that builds a graph often should not import component classes: it lives in a store, it loads the graph from
a server, or it serializes it. Register the components once, under keys, with `withNodeComponents()` inside
`provideVflow()`, and name the key in `component`:

```typescript
@Component({
  providers: [provideVflow(withNodeComponents({ request: RequestNodeComponent, approval: ApprovalNodeComponent }))],
  ...
})
export class DemoComponent {
  nodes = createNodes([
    { id: 'request', point: { x: 0, y: 0 }, component: 'request', data: { title: 'Conference tickets', amount: 480 } },
    { id: 'approval', point: { x: 300, y: 60 }, component: 'approval', data: { approver: 'Dana Whitfield' } },
  ]);
}
```

A value is a class or a `() => import(...)` factory, as in `component` itself. `provideVflow()` goes into the
providers of the application, a route or a component, and a registration closer to the flow adds its keys to one
further up; see [Configuration](/docs/getting-started/configuration). A key that nothing registers throws when the node
is created, with the key in the message.

`toStaticNodes()` keeps the key in the snapshot of a graph, so the graph serializes; see [Persisting a graph](/docs/graph/persisting-graph). A key is any string by default. To have the compiler check it, augment the `VflowNodeComponents` interface of the
library with your keys; then a typo in `component` or in `withNodeComponents()` is a compile error:

```typescript
declare module 'ngx-vflow' {
  interface VflowNodeComponents {
    request: typeof RequestNodeComponent;
    approval: typeof ApprovalNodeComponent;
  }
}
```

{{ NgDocActions.demoPane("ComponentNodesDemoComponent") }}

## Listen to the outputs of component nodes

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

`isComponentNodeEvent(event, Cmp)` checks the component class and narrows the event to `ComponentNodeEvent<Cmp>`: the
union of the outputs of that class, where `eventName` is one of their names and `eventPayload` has its type.

```ts
  ...

  handleComponentEvent(event: AnyComponentNodeEvent) {
    if (isComponentNodeEvent(event, RequestNodeComponent) && event.eventName === 'submitted') {
      console.log(event.eventPayload.amount) // RequestData
    }

    if (isComponentNodeEvent(event, ApprovalNodeComponent) && event.eventName === 'decided') {
      console.log(event.eventPayload) // 'approved' | 'rejected'
    }
  }

  ..
```

Only public outputs appear in the narrowed type; a `protected` output is forwarded at runtime all the same.
