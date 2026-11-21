The inputs, methods, signals and events of `VflowComponent` that concern the viewport, the minimap and panels. Every input
is also a key of `withSettings()`, see [Configuration](/docs/getting-started/configuration).

## Gesture inputs

| Input                     | Default    | Behavior                                                                                                                                                                                                                                                         |
| ------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minZoom`, `maxZoom`      | `0.5`, `3` | Limits of the zoom, for gestures and for programmatic changes.                                                                                                                                                                                                   |
| `panOnDrag`               | `true`     | Drag to pan with any mouse button or one finger. Use an array of mouse button numbers, such as `[0, 1]`, to restrict mouse buttons. Arrays do not disable touch panning; `false` does.                                                                           |
| `panOnScroll`             | `false`    | Wheel or two-finger trackpad scrolling pans the viewport.                                                                                                                                                                                                        |
| `zoomOnScroll`            | `true`     | Ordinary wheel/trackpad scrolling zooms.                                                                                                                                                                                                                         |
| `zoomOnPinch`             | `true`     | Trackpad or touchscreen pinch zooms.                                                                                                                                                                                                                             |
| `zoomOnDoubleClick`       | `false`    | Double-click zooms.                                                                                                                                                                                                                                              |
| `paneClickDistance`       | `6`        | Distance in CSS pixels a press that pans may move and still be a click. Within it the click reaches the pressed element, such as an edge or a control in an edge label, and on the empty pane it clears the selection. Zero requires a press that does not move. |
| `nodeDragThreshold`       | `3`        | Distance in CSS pixels a press on a node moves before the drag and its start event begin. A press released within it is a click: the node keeps its place and is selected.                                                                                       |
| `connectionDragThreshold` | `0`        | Client-space distance before connection or reconnection dragging and its start event begin.                                                                                                                                                                      |

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

`VflowMinimapComponent`, selector `v-minimap`, is part of the `Vflow` imports array and goes inside `vflow`. The
element is the block: it has no frame and no position of its own. It draws with SVG that fills it: the nodes
stay in place during pan and zoom, and are drawn again when node geometry or a style changes.

| Input      | Default | Description                    |
| ---------- | ------- | ------------------------------ |
| `pannable` | `false` | Click, drag and scroll panning |
| `zoomable` | `false` | Wheel and trackpad pinch zoom  |

Block:

- By default `width: clamp(120px, 20%, 240px)`, `aspect-ratio: 4 / 3`, `background: var(--v-background)` and `overflow: hidden`, all without specificity. Any CSS of the application changes the size, the background, the border and the radius.
- Place it with [`vPanel`](#panel) or with your own CSS.

What it shows:

- The bounds of the minimap are the bounds of the nodes united with the viewport, with 5 pixels of padding, so the viewport is always inside the minimap. While the viewport reaches beyond the nodes, the minimap zooms out as the viewport moves.
- A mask of `--v-minimap-mask` covers everything outside the viewport, above the nodes. The viewport is marked at least 8 by 8 pixels large, and outlined with `--v-minimap-viewport`.
- Selection is not shown.

Nodes are drawn by the `--v-minimap-node`, `--v-minimap-node-border` and `--v-minimap-node-radius` tokens, and a node with children by `--v-minimap-group`, `--v-minimap-group-border` and the same radius, see [Tokens and attributes](/docs/reference/styling#core-tokens).

`nodeStyles` of `withMinimapSettings()` maps the key a node component is registered under with `withNodeComponents()` onto a `MinimapNodeStyleRule`: a `MinimapNodeStyle`, or a function `(node: Node) => MinimapNodeStyle | undefined`.

| `MinimapNodeStyle` key | Over token                                              | Description                                                      |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `background`           | `--v-minimap-node` or `--v-minimap-group`               | Fill; any CSS color, `var()` included                            |
| `borderColor`          | `--v-minimap-node-border` or `--v-minimap-group-border` | Outline, one CSS pixel of the minimap wide, centered on the edge |
| `borderRadius`         | `--v-minimap-node-radius`                               | Corner radius in flow pixels, limited to half the shorter side   |

- A style overrides only the keys it sets. Nodes without a key, drawn by a template or by a component named by its class, take the tokens. A node carries no minimap style of its own.
- A rule that is a function is called again when a signal it read changes, or when nodes are added or removed; moving nodes calls no function. Nodes with the same fill and outline are drawn as one path; parents are drawn before their members.
- A `withMinimapSettings()` closer to the flow adds its keys to one further up; a key it sets replaces the rule of that key above.
- Colors are CSS: tokens and `var()` resolve on the `v-minimap` element and follow the theme, see [Tokens and attributes](/docs/reference/styling#core-tokens).
- While the viewport stays within the bounds of the nodes, a pan or a zoom moves only the mask. When the viewport reaches beyond them, every frame draws the nodes again, as one path per style.

Gestures:

- `pannable` enables click/tap, mouse drag, single-finger touch drag, and scroll panning. A click centers the main viewport on the chosen point without changing zoom. A drag begins once the pointer has moved farther than the main flow's `paneClickDistance`, in client-space CSS pixels: it moves the viewport by the movement of the pointer at the current scale of the minimap, and a drag that begins outside the marked viewport centers it on the pressed point first.
- `zoomable` enables wheel and trackpad pinch zoom around the main viewport center. Each wheel event multiplies or divides zoom by half the step of the zoom keys and `zoomIn()` / `zoomOut()` (`√1.2`, about `1.095`), according to scroll direction: a trackpad sends many wheel events per gesture. Zoom respects the main flow's `minZoom` and `maxZoom`.
- Both switches default to `false` and additionally respect the main flow's gesture settings. `panOnDrag` and its permitted mouse buttons control dragging and clicking; the pan activation key can enable these gestures. Selection activation takes priority over panning. `panOnScroll` or the pan activation key routes ordinary scrolling to pan, unless the zoom activation key is held. `zoomOnScroll` or the zoom activation key controls wheel zoom, and `zoomOnPinch` controls trackpad pinch.

A read-only minimap lets the pointer through to the pane. An opted-in minimap captures pointer input only inside its own rectangle and suppresses wheel page scrolling there, including at zoom limits or when a main-flow gesture is disabled. A drag continues outside the minimap using pointer capture; pointer cancellation, lost capture, window blur, or disabling `pannable` ends it.

Two-finger touchscreen pinch, minimap keyboard navigation, and viewport translation bounds are not included.

## Panel

`VflowPanelDirective`, selector `[vPanel]`, is part of the `Vflow` imports array. It places an element of the flow
content against a corner or a side of the flow.

| Input    | Default  | Description                                                                                                                              |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `vPanel` | required | `top-left`, `top-center`, `top-right`, `center-left`, `center-right`, `bottom-left`, `bottom-center` or `bottom-right` (`PanelPosition`) |

- The directive sets `data-v-panel="<position>"`; the placement is CSS: `position: absolute`, a margin of `--v-panel-offset` (`10px`) and the sides of the position. The rules have no specificity.
- The element is positioned against the flow when it is a direct child of `vflow` or inside wrappers without positioning of their own.
- Panels at the same position overlap.

## Portal

`VflowPortalDirective`, selector `ng-template[vPortal]`, is part of the `Vflow` imports array. The flow renders its
template in a layer of the viewport, in flow space. The template has no context: it closes over the place that
declares it, which may be anywhere inside `vflow`.

| Input          | Default          | Description                                                                                                                                                                            |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vPortal`      | `{ x: 0, y: 0 }` | Flow-space point of the top-left corner of the content. With `null` or `undefined` nothing renders                                                                                     |
| `vPortalLayer` | `above`          | `above`: over the nodes, edges and edge labels, under the alignment guides, the selection box and the connection line. `below`: under every node and edge, groups below edges included |

- The content is outside the graph: alignment guides, the minimap, `fitView()`, `getNodeRect()`, `getNodesBounds()`, `getNodesAtPoint()`, `getIntersectingNodes()`, culling, the selection box, click selection and keyboard navigation do not see it. It is always rendered.
- The layers and the content let the pointer through. An element with `pointer-events: auto` takes it: a press pans the viewport and a click clears the selection, as on the pane, unless the element is inside `vNoPan`, `vNoDrag` or `vNoWheel`.
- Several portals in one layer paint in the order they were declared.
- Nothing is measured: on a server the content renders at its point. Until the first layout completes it is hidden with the rest of the viewport.

## See also

- [Gestures](/docs/viewport/viewport-gestures)
- [Controlling the viewport](/docs/viewport/viewport-control)
- [Minimap](/docs/viewport/minimap)
- [Panels](/docs/viewport/panel)
- [Content on the canvas](/docs/viewport/portal)
