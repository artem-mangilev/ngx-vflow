`VflowResizableComponent`, selector `[vResizable]`, adds four lines and four corner handles to a node. A drag on a
control resizes the node, and moves it when a left or top side is dragged. The host element is the sizing box of the
node.

## Inputs

| Input                                            | Default | Description                                                                                                 |
| ------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------- |
| `vResizable`                                     | `true`  | `false` hides the controls; the element stays the sizing box                                                |
| `minWidth`, `minHeight`, `maxWidth`, `maxHeight` |         | Limits in flow units. Without an input, the `min-*` and `max-*` CSS of the element apply, read at the press |
| `keepAspectRatio`                                | `false` | Keeps the ratio of width to height during a resize                                                          |
| `resizeAxis`                                     |         | `horizontal` or `vertical` restricts resizing to that axis; both axes resize without it                     |
| `autoScale`                                      | `true`  | Corner handles keep their on-screen size while the viewport zooms out                                       |
| `gap`                                            | `1.5`   | Distance between the node box and the controls                                                              |
| `shouldResize`                                   |         | `(event: ResizeEvent) => boolean`, called before a step is applied; `false` skips the step                  |

## Outputs

| Output          | Emits                                   |
| --------------- | --------------------------------------- |
| `(resizeStart)` | `ResizeEvent` at the press on a control |
| `(resize)`      | `ResizeEvent` on every applied step     |
| `(resizeEnd)`   | `ResizeEvent` at the release            |

## `ResizeEvent`

| Field             | Description                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `node`            | The node being resized                                                                                                                                                                                                         |
| `x`, `y`          | Position of the node                                                                                                                                                                                                           |
| `width`, `height` | Size of the node                                                                                                                                                                                                               |
| `direction`       | `{ x, y }`: the direction the dragged side moved since the previous step, `1` right or down, `-1` left or up, `0` no change. Growing from a left or top control is `-1`. `{ x: 0, y: 0 }` in `(resizeStart)` and `(resizeEnd)` |
| `sourceEvent`     | The pointer event being handled: the press, a move or the release                                                                                                                                                              |

## Size written to the element

- For each `explicit` axis the directive sets `width` or `height` inline on its element.
- While any axis is explicit the element has `box-sizing: border-box`. The CSS `min-*` and `max-*` of an `auto` axis
  then apply to the border box as well.
- An `auto` axis receives no inline size.
- The controls and the handles are positioned against the same box, outside its content, so `overflow: hidden` on
  the element does not clip the controls.

## Size changes

`(nodesChanges.size)` on `vflow` emits `NodeSizeChange[]`:

| Field  | Description                                    |
| ------ | ---------------------------------------------- |
| `id`   | Id of the node                                 |
| `size` | `{ width, height }`, the rendered size         |
| `mode` | `{ width, height }`, each `explicit` or `auto` |

A resize of a node with `width` and `height` signals writes the new size into them. A resize of a node without them
writes nothing to the node.

## Appearance

| Hook                             | Styles                                       |
| -------------------------------- | -------------------------------------------- |
| `--v-resize-control`             | Color of the handles and lines               |
| `--v-resize-control-border`      | Border that separates a handle from the node |
| `data-v-resize-control`          | `handle` on a corner, `line` on a side       |
| `data-v-resize-control-position` | The side or corner of the control            |

Resize controls set `touch-action: none` and do not start a node drag.

## See also

- [Resizing](/docs/nodes/resizer)
- [Node sizes](/docs/concepts/node-sizes)
