`VflowHandleDirective`, selector `[vHandle]`, exported as `vHandle`, turns an element of a node presentation into a
handle. The library registers and measures the element. Core ships no visual for a handle.

## Inputs

| Input                | Default  | Description                                                                                                       |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `handleType`         | `source` | `source`, `target`, or `any` to start and accept connections in either direction                                  |
| `position`           | `top`    | Where the connection point is: `left`, `right`, `top`, `bottom`, `auto` or `center`, see below                    |
| `handleId`           |          | Identifies the handle when a node has more than one of a role; `Edge.sourceHandle` and `targetHandle` refer to it |
| `layout`             | `auto`   | `auto` or `manual`, for the side positions, see below                                                             |
| `offsetX`, `offsetY` | `0`      | Shift of the element and its connection point in the `auto` layout, in flow units; positive is right and down     |
| `canStart`           | `true`   | Whether a new connection may start from this handle; a press on a handle that cannot start drags the node instead |
| `canAccept`          | `true`   | Whether the handle may accept a connection or reconnection candidate                                              |
| `domAttributes`      |          | `data-*`, `title`, `lang` and `dir` applied to the element; handles carry no ARIA semantics                       |

## Type and direction

A `source` handle starts connections and a `target` handle accepts them; a connection dragged from a target handle onto a source handle is reversed, so the edge always runs from the source handle. Two handles of the same type do not connect. A handle of type `any` connects in either direction and the edge keeps the direction of the gesture. Every check runs before `ConnectionSettings.validator()`.

## Position

A side puts the connection point on that side of the node: the element sits there in the `auto` layout, or where the application placed it in the `manual` layout.

`auto` and `center` describe the point of each edge instead of a fixed spot: with `auto` the edge meets the middle of the node side that faces the other end, with `center` it runs to the node center. The element is then only the surface that starts and accepts connections; it is not positioned and its own box is not measured. Example of a whole node as a handle:

{% raw %}

```html
<div vHandle handleType="any" position="auto">
  <div vDragHandle>{{ title }}</div>
  <div>Drag from here to connect</div>
</div>
```

{% endraw %}

An element with `vDragHandle` inside the handle keeps dragging the node. The edge layer lies under the nodes: arrow markers stay visible with `auto` and are hidden under the node with `center`.

## Layout

- `auto` (default): the directive writes `top` and `left` on the element, and the flow stylesheet makes it absolute and centers it on that point with `translate`, so it sits on the `position` side of the node at the center of its parent element. The connection point is the outer edge of the element on that side.
- `manual`: the directive writes no styles. Position the element yourself; the connection point is read from the element's box on the `position` side, and `offsetX` and `offsetY` are ignored.

In the `auto` layout the flow owns `position`, `top`, `left` and `translate` on the element; `transform` and `scale` stay yours.

A handle follows its element when a list scrolls inside the node. Once the element is scrolled out of view, the connection point stays on the border of the scroll container it left through, so the edge never ends outside of the list, the element carries `data-v-handle-clipped`, and the handle has no magnet for a connection in progress. In the `auto` layout the parent element is what counts as in view.

A handle is measured only while it is in layout. An element with `display: none`, or inside one, is not measured, and edges attached to it are hidden. `visibility: hidden` and `opacity: 0` keep the handle in layout.

## State attributes

The element gets the `data-v-handle` attribute, its identity as a handle, and these:

| Attribute                  | Values                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `data-v-handle-type`       | `source`, `target`                                                                                    |
| `data-v-handle-position`   | `left`, `right`, `top`, `bottom`                                                                      |
| `data-v-handle-state`      | `idle`; `connecting` on the handle a connection is dragged from; `valid` / `invalid` on the candidate |
| `data-v-handle-can-start`  | present while the handle can start a connection (`canStart`)                                          |
| `data-v-handle-can-accept` | present while the handle can accept a connection (`canAccept`)                                        |
| `data-v-handle-clipped`    | present while the handle is scrolled out of view inside the node                                      |

`data-v-handle-state` follows the default connection checks and `ConnectionSettings.validator()`. The handle a
connection is dragged from stays `connecting` for the whole gesture: it is never its own candidate, and a release on
it is a drop. While a connection is in progress the handle element is a drop zone in addition to the magnet around
its point, so a handle of any size validates the candidate under the pointer.

## Signals

The directive is exported as `vHandle`. A template reference gives access to its signals `state`, `handleType`, `position`, `handleId`, `canStart`, `canAccept` and `layout`:

{% raw %}

```html
<span #h="vHandle" vHandle handleType="target" position="left" class="dot" [title]="h.state()"></span>
```

{% endraw %}

A component that applies the directive through `hostDirectives`, or any element inside a handle element, reads the
same signals by injecting `VflowHandleDirective`.

Handles carry no ARIA semantics and are not reachable from the keyboard; see
[Accessibility model](/docs/concepts/accessibility#limits).

## See also

- [Handles](/docs/handles/handles)
- [Connections](/docs/handles/connections)
