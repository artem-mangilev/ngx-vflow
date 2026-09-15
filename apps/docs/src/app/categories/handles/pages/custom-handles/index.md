A handle is an element of your node presentation with the `vflowHandle` directive. The library registers and measures the element and, by default, places it on the node side. Core ships no visual for a handle: size, color, border and pointer events belong to your application.

```html
<span vflowHandle type="source" position="right" class="dot"></span>
```

> **Info**
> With `@vflow/ui`, use `vflowPort` instead of `vflowHandle`: it is a handle with the standard port visual and valid/invalid feedback and takes the same inputs: `<span vflowPort type="target" position="left"></span>`.

## Inputs

| Input                                           | Default  | Description                                                                       |
| ----------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `vflowHandle`                                   | `source` | Handle type: `source` or `target`                                                 |
| `position`                                      | `top`    | Side of the node: `left`, `right`, `top` or `bottom`                              |
| `id`                                            |          | Identifies the handle when a node has more than one handle of a type              |
| `layout`                                        | `auto`   | `auto` or `manual`, see below                                                     |
| `offsetX`, `offsetY`                            | `0`      | Shift of the element and its connection point in the `auto` layout, in flow units |
| `canStart`                                      | `true`   | Whether a new connection may start from this handle                               |
| `canAccept`                                     | `true`   | Whether the handle may accept a connection or reconnection candidate              |
| `ariaLabel`, `ariaDescription`, `domAttributes` |          | Accessibility metadata, see the Accessibility page                                |

## Layout

- `auto` (default): the directive writes `position: absolute`, the side offsets and `transform` on the element, so it sits on the `position` side of the node at the center of its parent element. The connection point is the outer edge of the element on that side.
- `manual`: the directive writes no styles. Position the element yourself; the connection point is read from the element's box on the `position` side, and `offsetX` and `offsetY` are ignored.

Put the directive on a non-form element such as `span` or `div`: on `button` or `input` the static `type` attribute also sets the native `type`.

In the `auto` layout the directive owns `transform` on the element. For hover effects use the CSS `scale` or `translate` properties, or animate an inner element.

A handle must stay in layout. An element with `display: none`, or inside one, is not measured: edges attached to it are hidden and a warning is logged in development mode. Hide a handle with `visibility: hidden` or `opacity: 0` instead, and give an invisible handle a size if users must be able to drag from it.

## State

The element gets the `vflow-handle` class and these attributes:

| Attribute                      | Values                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `data-vflow-handle-type`       | `source`, `target`                                                                       |
| `data-vflow-handle-position`   | `left`, `right`, `top`, `bottom`                                                         |
| `data-vflow-handle-state`      | `idle`, or `valid` / `invalid` while the handle is the candidate of a connection gesture |
| `data-vflow-handle-can-start`  | `true`, `false`                                                                          |
| `data-vflow-handle-can-accept` | `true`, `false`                                                                          |

The state follows `ConnectionSettings.validator()`, so plain CSS is enough for connection feedback:

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

The directive is exported as `vflowHandle`. A template reference gives access to its signals `state`, `type`, `position`, `id`, `canStart`, `canAccept` and `layout`:

{% raw %}

```html
<span #h="vflowHandle" vflowHandle type="target" position="left" class="dot" [title]="h.state()"></span>
```

{% endraw %}

## Handle components

A component can become a handle by applying the directive through `hostDirectives`. Forward the inputs that the places using the component bind, including the type and `position`. `injectHandle()` returns the handle of the current element or of the closest ancestor element that is a handle, with the `state`, `type`, `position`, `id`, `canStart` and `canAccept` signals.

```ts
@Component({
  selector: 'square-handle',
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['type', 'position', 'id', 'canAccept'] }],
  host: {
    '[class.valid]': "handle.state() === 'valid'",
    '[class.invalid]': "handle.state() === 'invalid'",
  },
  template: '',
})
export class SquareHandleComponent {
  protected readonly handle = injectHandle();
}
```

```html
<square-handle type="target" position="left" [id]="'input-1'" [canAccept]="canAccept()" />
```

## Demo

The demo intentionally uses the default connection validation so it isolates the handle policies: disable `canStart` on Output 1 and `canAccept` on Input 1 independently. The outputs are plain elements styled through the attributes above; the inputs are the `square-handle` component. The dimmed handle is disabled; Output 2 remains a working source for comparison. See the separate Connection validation demo for `ConnectionSettings.validator()`.

{{ NgDocActions.demoPane("CustomHandlesDemoComponent") }}
