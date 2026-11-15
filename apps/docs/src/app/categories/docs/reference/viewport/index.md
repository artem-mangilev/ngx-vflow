The inputs, methods, signals and events of `VflowComponent` that concern the viewport, and the minimap. Every input
is also a key of `withSettings()`, see [Configuration](/docs/getting-started/configuration).

## Gesture inputs

| Input                     | Default    | Behavior                                                                                                                                                                               |
| ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minZoom`, `maxZoom`      | `0.5`, `3` | Limits of the zoom, for gestures and for programmatic changes.                                                                                                                         |
| `panOnDrag`               | `true`     | Drag to pan with any mouse button or one finger. Use an array of mouse button numbers, such as `[0, 1]`, to restrict mouse buttons. Arrays do not disable touch panning; `false` does. |
| `panOnScroll`             | `false`    | Wheel or two-finger trackpad scrolling pans the viewport.                                                                                                                              |
| `zoomOnScroll`            | `true`     | Ordinary wheel/trackpad scrolling zooms.                                                                                                                                               |
| `zoomOnPinch`             | `true`     | Trackpad or touchscreen pinch zooms.                                                                                                                                                   |
| `zoomOnDoubleClick`       | `false`    | Double-click zooms.                                                                                                                                                                    |
| `paneClickDistance`       | `6`        | Per-axis viewport translation tolerance in CSS pixels for treating a pan as a click that clears selection. Zero requires no translation.                                               |
| `nodeDragThreshold`       | `0`        | Client-space distance in CSS pixels before node dragging and its start event begin.                                                                                                    |
| `connectionDragThreshold` | `0`        | Client-space distance before connection or reconnection dragging and its start event begin.                                                                                            |

Positive activation thresholds must be exceeded to start a drag. They are independent of viewport zoom. Releasing below the threshold does not emit drag start/end events. Negative or non-finite distance inputs are treated as zero. The selection-box minimum size is unchanged.

## Activation modifiers

`panActivation` and `zoomActivation` are entries of the `modifiers` section of
[keyboard shortcuts](/docs/reference/keyboard-shortcuts). Both default to an empty list, which disables their
keyboard activation and leaves ordinary pan and zoom gestures as the inputs set them.

- `panActivation` temporarily enables drag and scroll panning. Configured mouse-button restrictions still apply.
- `zoomActivation` temporarily enables wheel zoom and takes priority over scroll panning.
- Otherwise, enabled `panOnScroll` takes priority over `zoomOnScroll`.
- Pinch remains controlled by `zoomOnPinch`. Browsers also report Ctrl+wheel as pinch, so disabling pinch disables that path even with Control mapped to `zoom`.
- Explicit keyboard selection takes priority over drag panning. `multiSelection` remains independent.
- A draggable node keeps its own drag behavior even while the pan key is held. Explicit no-pan regions are also respected.
- New activation shortcuts ignore keydown events from inputs, textareas, selects, and contenteditable regions, including modifier keys. Pressed keys reset when the window loses focus.

Settings are read when handling events. An already-started drag finishes normally; the activation threshold is captured at pointer down. Wheel routing responds to subsequent events. No special mid-gesture cancellation is performed.

## Gesture exclusions

`VflowNoDragDirective`, `VflowNoPanDirective` and `VflowNoWheelDirective` are part of the `Vflow` imports array.
Each applies to its element and descendants:

- `vNoDrag` prevents node dragging and viewport panning.
- `vNoPan` prevents viewport panning, including scroll panning; node dragging and zoom are unaffected.
- `vNoWheel` leaves wheel events, including trackpad pinch, to the browser/control. It does not block touchscreen gestures; combine it with `vNoDrag` for scrollable controls inside draggable nodes.

Built-in resize controls carry `vNoDrag`.

## Wheel zoom

Wheel zoom eases towards its target. Every wheel event moves the target by its step, and the viewport follows on animation frames with a short time constant, so a mouse wheel notch glides instead of jumping, and a burst of trackpad events costs one viewport update per frame. The first step runs within the event itself, so the response is immediate. Pinch follows the fingers at once. The gesture ends once the events have stopped and the zoom has settled.

## Page scrolling

Wheel zoom suppresses page scrolling when it consumes an event. A new outward wheel gesture at a reached zoom limit can scroll the page. Scroll panning consumes its events. Disabled wheel gestures and `vNoWheel` leave native scrolling available. There is no separate `preventScrolling` setting.

The browser decides whether a touch scrolls the page from CSS `touch-action` when the finger lands, so the flow sets it on the pane:

| Settings                                  | Pane `touch-action` | Effect                                                |
| ----------------------------------------- | ------------------- | ----------------------------------------------------- |
| `panOnDrag` is not `false`                | `none`              | Touches pan and pinch the flow; the page stays still. |
| `panOnDrag` is `false`, `zoomOnPinch` on  | `pan-x pan-y`       | One finger scrolls the page; two fingers pinch.       |
| `panOnDrag` is `false`, `zoomOnPinch` off | `auto`              | The flow leaves touches to the page.                  |

Draggable nodes, drag handles, handles and resize controls use `none`, so they stay draggable wherever the pane lets the page scroll. Scrollable controls inside nodes, such as a `textarea` or an element with `overflow: auto`, keep their own finger scrolling. A finger on an opted-out region that does not scroll itself cannot scroll the page while touch panning is enabled. Application CSS such as `touch-action: none` on an ancestor can still prevent native scrolling.

## Auto-pan

`autoPan` accepts a boolean or `AutoPanSettings`. The default `true` enables auto-pan for node dragging, connection
creation and reconnection; `false` disables all three.

| Option           | Default | Meaning                                                                                             |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `nodeDrag`       | `true`  | Auto-pan while dragging nodes.                                                                      |
| `connectionDrag` | `true`  | Auto-pan while creating or reconnecting an edge.                                                    |
| `speed`          | `600`   | Maximum speed per axis in viewport pixels per second, independent of zoom and display refresh rate. |
| `margin`         | `48`    | Distance from each viewport edge, in pixels, where auto-pan starts.                                 |

Speed and margin are shared by both operations. Movement accelerates quadratically toward an edge; at half the margin, speed is one quarter of the maximum. The default speed approximates the previous behavior at 60 Hz.

Omitted fields use their defaults. Setting either `speed` or `margin` to zero disables auto-pan. Negative numbers, `NaN`, and infinities fall back to the corresponding default.

Settings are captured when the editor is created. Updating the input or mutating its options afterward has no effect; recreate the editor to apply different settings. Auto-pan for selection and keyboard focus is not supported.

`autoPanOnNodeFocus`, `true` by default, centers a node that receives keyboard focus while fully offscreen, at the
current zoom.

## Methods

| Method                                  | Effect                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fitView(options?)`                     | Fits the given nodes, or all of them, into the flow                                      |
| `setCenter(point, options?)`            | Puts a flow-space point in the center of the flow, at `options.zoom` or the current zoom |
| `setViewport(viewport, options?)`       | Sets `x`, `y` and `zoom`                                                                 |
| `zoomTo(zoom, options?)`                | Zooms around the center of the flow                                                      |
| `zoomIn(options?)`, `zoomOut(options?)` | Zoom around the center by the step of the zoom keys, `1.2`                               |

Every method takes `duration`, the length of the animated transition in milliseconds; `0`, the default, changes the
viewport at once. `fitView()` also takes:

| Option               | Meaning                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `nodes`              | Ids of the nodes to fit; all nodes when omitted or empty                  |
| `padding`            | Space around the fitted nodes, as a share of their size; `0.1` by default |
| `minZoom`, `maxZoom` | Limits for this fit, within the `minZoom` and `maxZoom` of the flow       |

- Zoom is clamped to the `minZoom` and `maxZoom` of the flow; `x` and `y` stay as given.
- Methods apply at once and in order, each from where the previous one leads.
- Each returns a promise that settles when the change ends: `true` when the viewport reached the target, `false`
  when there was nothing to change or another change or a gesture interrupted it first.
- The methods read no signal in a tracked way, so an effect may call them without `untracked`.

Queries such as `getNodesBounds()`, `getNodeRect()` and `getNodesAtPoint()` are signal reads:
`computed(() => flow.getNodesBounds())` follows the nodes, and an effect that reads a query reruns when its answer
may change.

## Signals and events

| Member                                     | Description                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `viewport`                                 | Signal of `{ x, y, zoom }`; follows every frame of a gesture or an animation                                                                                                                      |
| `settings.minZoom()`, `settings.maxZoom()` | The resolved zoom limits                                                                                                                                                                          |
| `(initialized)`                            | Emitted once, when the first layout is complete: the flow has a size, and every node has its size and handle positions. An empty graph completes it too. A later subscription does not receive it |
| `(viewportChangeEnd)`                      | Emits the viewport when a change ends: a drag or a touch gesture is released, a double-click zoom lands, a series of wheel events stops for 150 ms, a programmatic call lands or is interrupted   |

## Minimap

`VflowMinimapComponent`, selector `v-minimap`, is projected into `vflow` by its selector. It draws on a canvas, caches
node previews during pan and zoom, updates them when node geometry or selection changes, and keeps the image sharp
on high-DPI displays.

| Input      | Default        | Description                                              |
| ---------- | -------------- | -------------------------------------------------------- |
| `position` | `bottom-right` | `top-left`, `top-right`, `bottom-left` or `bottom-right` |
| `pannable` | `false`        | Click, drag and scroll panning                           |
| `zoomable` | `false`        | Wheel and trackpad pinch zoom                            |

- `pannable` enables click/tap, mouse drag, single-finger touch drag, and scroll panning. Clicking centers the main viewport on the chosen point without changing zoom. Dragging its visible area preserves the grab offset; dragging elsewhere centers first and then follows the pointer. The main flow's `paneClickDistance` distinguishes a click from a drag, in client-space CSS pixels.
- `zoomable` enables wheel and trackpad pinch zoom around the main viewport center. Each wheel event multiplies or divides zoom by half the step of the zoom keys and `zoomIn()` / `zoomOut()` (`√1.2`, about `1.095`), according to scroll direction: a trackpad sends many wheel events per gesture. Zoom respects the main flow's `minZoom` and `maxZoom`.
- Both switches default to `false` and additionally respect the main flow's gesture settings. `panOnDrag` and its permitted mouse buttons control dragging and clicking; the pan activation key can enable these gestures. Selection activation takes priority over panning. `panOnScroll` or the pan activation key routes ordinary scrolling to pan, unless the zoom activation key is held. `zoomOnScroll` or the zoom activation key enables wheel zoom; `zoomOnPinch` controls trackpad pinch. The minimap switches must still be enabled.

An opted-in minimap captures pointer input only inside its own rectangle and suppresses wheel page scrolling there, including at zoom limits or when a main-flow gesture is disabled. The surrounding pane remains interactive. A drag continues outside the minimap using pointer capture; pointer cancellation, lost capture, window blur, or disabling `pannable` ends it. Main pan-policy changes are checked on the next pointer event. Wheel input during a pointer drag is ignored.

Two-finger touchscreen pinch, minimap keyboard navigation, and viewport translation bounds are not included. Per-node presentation hooks are planned separately.

## See also

- [Gestures](/docs/viewport/viewport-gestures)
- [Controlling the viewport](/docs/viewport/viewport-control)
- [Minimap](/docs/viewport/minimap)
