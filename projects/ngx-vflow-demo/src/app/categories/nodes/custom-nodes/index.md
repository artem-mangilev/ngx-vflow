---
keyword: 'FeaturesCustomNodes'
---

> **Warning**
> Be careful with CSS rules applied to node content. Custom nodes are implemented with SVG's `foreignObject` element, and Safari has issues with some CSS rules inside `foreignObject`. Therefore, please check this browser when applying complex styling.

This is where things become a lot more interesting. You can create custom nodes with HTML and CSS.

## Template nodes

You can create custom nodes with `ng-template`

Follow these steps to achieve this:

1. Set `type` of node to `html-template`
2. Provide `ng-template` with `nodeHtml` selector inside `vflow`
3. Write your HTML inside this template
4. You can also pass any data with `data` field on node, and then get it inside `ng-template`

{{ NgDocActions.demoPane("CustomNodesDemoComponent") }}

## Component nodes

Another approach is to render nodes from components.

Its benefits:

- type-safe node data access
- good for complex flows with many different node types

Its limitations

- it's harder to manage events because such nodes are rendered dynamically

How to create component node:

1. Create a regular angular standalone component
2. Extend with `CustomNodeComponent` (please see the reference of this base component to get an idea of what fields you could use in your custom component node), otherwise it won't work!
3. Pass your data interface to generic of `CustomNodeComponent` to use in component. This `data` comes from `Node` definition
4. Use your new component in `type` field of `Node`. Library will render your node for you

{{ NgDocActions.demoPane("CustomComponentNodesDemoComponent") }}

### Handling events

> **Warning**
> This is an experimental API

There is a `(onComponentNodeEvent)` event on `VflowComponent`. Here is how it works:

1. It accumulates every `EventEmitter` of every component node of your flow
2. It emits on every emit of those emitters

The shape of this accumulator-event contains following useful info:

```ts
export type AnyComponentNodeEvent = {
  nodeId: string; // Id of node where event occurs
  eventName: string;
  eventPayload: unknown;
};
```

The Library also includes `ComponentNodeEvent` helper type to get type-safe event, where you just need to pass an array of your custom components in generic, and this type will infer proper types for `eventName` and `eventPayload`:

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
