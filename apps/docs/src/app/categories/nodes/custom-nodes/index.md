---
keyword: 'FeaturesCustomNodes'
---

This is where things become a lot more interesting. You can create custom nodes with HTML and CSS.

Custom node content is rendered as native HTML in the transformed flow viewport, so regular HTML layout and CSS rules apply.

## Template nodes

You can create custom nodes with `ng-template`

Follow these steps to achieve this:

1. Provide `ng-template` with the `node` selector inside `vflow`
2. Write your HTML inside this template
3. Pass any data with the `data` field of the node and read it inside the template through `ctx.data()`

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
   is the same one a `node` template receives as `let-ctx`: `data`, `selected`, `preselected`, `width`, `height` and
   the node itself
3. Put your component in the `component` field of `Node`. The library will render your node for you

A lazy import function in `component` loads the component only when it is needed; see the Lazy loading page.

{{ NgDocActions.demoPane("CustomComponentNodesDemoComponent") }}

### Handling events

> **Warning**
> This is an experimental API

There is a `(componentNodeEvent)` event on `VflowComponent`. Here is how it works:

1. It subscribes to every output declared by every component node of your flow: `@Output()`, `output()` and
   `outputFromObservable()`
2. It emits on every emit of those outputs and stops listening when the node is destroyed

The shape of this accumulator-event contains following useful info:

```ts
export type AnyComponentNodeEvent = {
  nodeId: string; // Id of node where event occurs
  eventName: string; // Property name of the output
  eventPayload: unknown;
};
```

The Library also includes `ComponentNodeEvent` helper type to get type-safe event, where you just need to pass an array of your custom components in generic, and this type will infer proper types for `eventName` and `eventPayload` from their outputs:

```ts
  ...

  handleComponentEvent(event: ComponentNodeEvent<[RedSquareNodeComponent, BlueSquareNodeComponent]>) {
    if (event.eventName === 'redSquareEvent') {
      console.log(event.eventPayload)
    }

    if (event.eventName === 'blueSquareEvent') {
      console.log(event.eventPayload.x + event.eventPayload.y)
    }
  }

  ..
```
