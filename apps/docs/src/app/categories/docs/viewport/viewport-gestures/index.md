This guide shows how to set up the way users pan and zoom a flow: the gestures, the keys that enable them, and the
controls inside nodes that must keep their own behavior. Every setting with its default and the exact rules are at
the end of this page.

Toggle the settings in this demo, then drag, scroll, pinch or double-click the canvas. The readout shows the
viewport the gestures produce.

{{ NgDocActions.demoPane("ViewportGesturesDemoComponent") }}

## Navigate like a canvas

A flow pans on drag and zooms on scroll and pinch by default, like a drawing canvas. To add double-click zoom, turn
it on:

```html
<vflow [nodes]="nodes" [zoomOnDoubleClick]="true" />
```

## Navigate like a document

If the flow is an editor where scrolling should move around the graph, pan on scroll, keep pinch for zoom and leave
dragging to the nodes. A key can still enable drag panning:

```html
<vflow [nodes]="nodes" [panOnDrag]="false" [panOnScroll]="true" />
```

```typescript
providers: [provideVflow(withShortcuts({ modifiers: { panActivation: ['Space'] } }))];
```

This configuration consumes ordinary scrolling over the flow.

## Let the page scroll over the flow

If the flow is embedded in a scrolling page and a wheel over it should scroll the page, turn off both scroll
gestures and leave their activation keys unbound. Pinch can stay on:

```html
<vflow [nodes]="nodes" [panOnScroll]="false" [zoomOnScroll]="false" />
```

To let a finger scroll the page as well, also set `[panOnDrag]="false"`.

## Pan or zoom only while a key is held

Bind the activation keys with `withShortcuts()` inside `provideVflow()`:

```typescript
providers: [
  provideVflow(
    withShortcuts({
      modifiers: {
        panActivation: ['Space'],
        zoomActivation: ['Mod'], // Meta on macOS, Control elsewhere
      },
    }),
  ),
];
```

Then turn off the gesture the key should enable, for example `[zoomOnScroll]="false"` to zoom only with the key
held. A list holds alternative keys, not a chord; see [Keyboard shortcuts](/docs/interactions/keyboard-shortcuts).

## Restrict panning to some mouse buttons

Pass the button numbers to `panOnDrag`, for example the left and the middle button:

```html
<vflow [nodes]="nodes" [panOnDrag]="[0, 1]" />
```

Touch panning stays on; only `false` turns it off.

## Require a small movement before a drag starts

A hand moves a little between a press and its release. So that such a press stays a click, a node drag starts after the pointer moves 3 CSS pixels, and a press that pans is still a click of the element under it within 6 pixels. A connection starts at the press.

If you want other distances, set them in CSS pixels. Zero starts a drag at the press:

```html
<vflow [nodes]="nodes" [nodeDragThreshold]="6" [connectionDragThreshold]="3" [paneClickDistance]="10" />
```

## Keep controls inside nodes usable

Mark the controls whose own gestures must win:

```html
<!-- Inside a node template: retain text editing and the textarea's own scrolling. -->
<textarea vNoDrag vNoWheel></textarea>

<!-- Prevent viewport panning from an overlay and its descendants. -->
<div vNoPan>...</div>
```

- If a control must not drag its node, use `vNoDrag`.
- If an area must not pan the viewport, use `vNoPan`.
- If a control scrolls on its own, use `vNoWheel`, and add `vNoDrag` when it sits inside a draggable node.

## Turn off every gesture

```html
<vflow [nodes]="nodes" [panOnDrag]="false" [panOnScroll]="false" [zoomOnScroll]="false" [zoomOnPinch]="false" [zoomOnDoubleClick]="false" />
```

and, in the providers, `withShortcuts({ modifiers: { panActivation: [], zoomActivation: [] } })`, so that no key
enables a gesture.

Programmatic calls continue to work, see [Controlling the viewport](/docs/viewport/viewport-control). Node dragging
and selection are configured separately.

## Tune auto-pan

The viewport follows the pointer when a node or a connection is dragged to its edge. To change the speed or the
margin, or to turn it off for one of the two, pass `AutoPanSettings`:

```html
<vflow [nodes]="nodes" [autoPan]="{ nodeDrag: true, connectionDrag: false, speed: 600, margin: 48 }" />
```

`[autoPan]="false"` turns it off. The settings are read when the flow is created.

## Settings

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
[keyboard shortcuts](/docs/interactions/keyboard-shortcuts#default-modifiers). Both default to an empty list, which disables their
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
