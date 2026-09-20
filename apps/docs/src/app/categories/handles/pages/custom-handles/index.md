A handle is an element of your node presentation with the `vflowHandle` directive. The library registers and measures the element and, by default, places it on the node side. Core ships no visual for a handle: size, color, border and pointer events belong to your application.

```html
<span vflowHandle handleType="source" position="right" class="dot"></span>
```

> **Info**
> With `@vflow/ui`, use `vflowPort` instead of `vflowHandle`: it is a handle with the standard port visual and valid/invalid feedback and takes the same inputs: `<span vflowPort handleType="target" position="left"></span>`.

## Inputs

| Input                | Default  | Description                                                                                                       |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `handleType`         | `source` | `source`, `target`, or `any` to start and accept connections in either direction                                  |
| `position`           | `top`    | Where the connection point is: `left`, `right`, `top`, `bottom`, `auto` or `center`, see below                    |
| `handleId`           |          | Identifies the handle when a node has more than one of a role; `Edge.sourceHandle` and `targetHandle` refer to it |
| `layout`             | `auto`   | `auto` or `manual`, for the side positions, see below                                                             |
| `offsetX`, `offsetY` | `0`      | Shift of the element and its connection point in the `auto` layout, in flow units; positive is right and down     |
| `canStart`           | `true`   | Whether a new connection may start from this handle                                                               |
| `canAccept`          | `true`   | Whether the handle may accept a connection or reconnection candidate                                              |
| `domAttributes`      |          | `data-*`, `title`, `lang` and `dir` applied to the element; handles carry no ARIA semantics                       |

## Type and direction

A `source` handle starts connections and a `target` handle accepts them; a connection dragged from a target handle onto a source handle is reversed, so the edge always runs from the source handle. Two handles of the same type do not connect. A handle of type `any` connects in either direction and the edge keeps the direction of the gesture. Every check runs before `ConnectionSettings.validator()`.

## Position

A side puts the connection point on that side of the node: the element sits there in the `auto` layout, or where the application placed it in the `manual` layout.

`auto` and `center` describe the point of each edge instead of a fixed spot: with `auto` the edge meets the middle of the node side that faces the other end, with `center` it runs to the node center. The element is then only the surface that starts and accepts connections; it is not positioned and its own box is not measured. A whole node becomes a handle this way:

{% raw %}

```html
<div vflowHandle handleType="any" position="auto">
  <div dragHandle>{{ title }}</div>
  <div>Drag from here to connect</div>
</div>
```

{% endraw %}

An element with `dragHandle` inside the handle keeps dragging the node. The edge layer lies under the nodes, so arrow markers stay visible with `auto`, and `center` suits lines without markers. See the Easy connect page in the cookbook.

## Layout

- `auto` (default): the directive writes `position: absolute`, the side offsets and `transform` on the element, so it sits on the `position` side of the node at the center of its parent element. The connection point is the outer edge of the element on that side.
- `manual`: the directive writes no styles. Position the element yourself; the connection point is read from the element's box on the `position` side, and `offsetX` and `offsetY` are ignored.

In the `auto` layout the directive owns `transform` on the element. For hover effects use the CSS `scale` or `translate` properties, or animate an inner element.

A handle must stay in layout. An element with `display: none`, or inside one, is not measured: edges attached to it are hidden and a warning is logged in development mode. Hide a handle with `visibility: hidden` or `opacity: 0` instead, and give an invisible handle a size if users must be able to drag from it.

## State

The element gets the `vflow-handle` class and these attributes:

| Attribute                      | Values                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `data-vflow-handle-type`       | `source`, `target`                                                                                    |
| `data-vflow-handle-position`   | `left`, `right`, `top`, `bottom`                                                                      |
| `data-vflow-handle-state`      | `idle`; `connecting` on the handle a connection is dragged from; `valid` / `invalid` on the candidate |
| `data-vflow-handle-can-start`  | `true`, `false`                                                                                       |
| `data-vflow-handle-can-accept` | `true`, `false`                                                                                       |

The state follows `ConnectionSettings.validator()`, so plain CSS is enough for connection feedback. While a connection is in progress the handle element is a drop zone in addition to the magnet around its point, so a handle of any size, even a whole node, validates the candidate under the pointer:

```css
.dot[data-vflow-handle-state='valid'] {
  background-color: green;
}

.dot[data-vflow-handle-state='invalid'] {
  background-color: red;
}

.dot[data-vflow-handle-can-start='false'] {
  opacity: 0.5;
}
```

The directive is exported as `vflowHandle`. A template reference gives access to its signals `state`, `handleType`, `position`, `handleId`, `canStart`, `canAccept` and `layout`:

{% raw %}

```html
<span #h="vflowHandle" vflowHandle handleType="target" position="left" class="dot" [title]="h.state()"></span>
```

{% endraw %}

## Handle components

A component can become a handle by applying the directive through `hostDirectives`. Forward the inputs that the places using the component bind, including `handleType` and `position`. Inject `VflowHandleDirective` to read its signals: `state`, `handleType`, `position`, `handleId`, `canStart`, `canAccept` and `layout`. The same works in any element inside a handle element, and in unit tests with `VflowMocks`, whose handle mock stands in for the directive.

```ts
@Component({
  selector: 'square-handle',
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['handleType', 'position', 'handleId', 'canAccept'] }],
  host: {
    '[class.valid]': "handle.state() === 'valid'",
    '[class.invalid]': "handle.state() === 'invalid'",
  },
  template: '',
})
export class SquareHandleComponent {
  protected readonly handle = inject(VflowHandleDirective);
}
```

```html
<square-handle handleType="target" position="left" [handleId]="'input-1'" [canAccept]="canAccept()" />
```

## Demo

The demo intentionally uses the default connection validation so it isolates the handle policies: disable `canStart` on Output 1 and `canAccept` on Input 1 independently. The outputs are plain elements styled through the attributes above; the inputs are the `square-handle` component. The dimmed handle is disabled; Output 2 remains a working source for comparison. See the separate Connection validation demo for `ConnectionSettings.validator()`.

{{ NgDocActions.demoPane("CustomHandlesDemoComponent") }}
