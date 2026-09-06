Control viewport gestures with inputs on `<vflow>`. Existing behavior is preserved unless you change these settings.

| Input                     | Default | Behavior                                                                                                                                                                               |
| ------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `panOnDrag`               | `true`  | Drag to pan with any mouse button or one finger. Use an array of mouse button numbers, such as `[0, 1]`, to restrict mouse buttons. Arrays do not disable touch panning; `false` does. |
| `panOnScroll`             | `false` | Wheel or two-finger trackpad scrolling pans the viewport.                                                                                                                              |
| `zoomOnScroll`            | `true`  | Ordinary wheel/trackpad scrolling zooms.                                                                                                                                               |
| `zoomOnPinch`             | `true`  | Trackpad or touchscreen pinch zooms.                                                                                                                                                   |
| `zoomOnDoubleClick`       | `false` | Double-click zooms.                                                                                                                                                                    |
| `paneClickDistance`       | `6`     | Per-axis viewport translation tolerance in CSS pixels for treating a pan as a click that clears selection. Zero requires no translation.                                               |
| `nodeDragThreshold`       | `0`     | Client-space distance in CSS pixels before node dragging and its start event begin.                                                                                                    |
| `connectionDragThreshold` | `0`     | Client-space distance before connection or reconnection dragging and its start event begin.                                                                                            |

Positive activation thresholds must be exceeded to start a drag. They are independent of viewport zoom. Releasing below the threshold does not emit drag start/end events. Negative or non-finite distance inputs are treated as zero. The selection-box minimum size is unchanged.

# Keyboard activation and priority

Use the existing `keyboardShortcuts` input for all activation keys:

```typescript
shortcuts: KeyboardShortcuts = {
  pan: ['Space'],
  zoom: ['MetaLeft', 'MetaRight'], // macOS; use ControlLeft/ControlRight elsewhere
};
```

Both new actions default to `null`. This disables their keyboard activation, **not** ordinary pan/zoom gestures. Arrays contain alternative `KeyboardEvent.code` values, not chords.

- `pan` temporarily enables drag and scroll panning. Configured mouse-button restrictions still apply.
- `zoom` temporarily enables wheel zoom and takes priority over scroll panning.
- Otherwise, enabled `panOnScroll` takes priority over `zoomOnScroll`.
- Pinch remains controlled by `zoomOnPinch`. Browsers also report Ctrl+wheel as pinch, so disabling pinch disables that path even with Control mapped to `zoom`.
- Explicit keyboard selection takes priority over drag panning. `multiSelection` remains independent.
- A draggable node keeps its own drag behavior even while the pan key is held. Explicit no-pan regions are also respected.
- New activation shortcuts ignore keydown events from inputs, textareas, selects, and contenteditable regions, including modifier keys. Pressed keys reset when the window loses focus.

Settings are read when handling events. An already-started D3 mouse drag finishes normally; the activation threshold is captured at pointer down. Wheel routing responds to subsequent events. No special mid-gesture cancellation is performed.

# Canvas configuration

This retains the current canvas behavior and adds optional double-click zoom:

```html
<vflow [nodes]="nodes" [panOnDrag]="true" [zoomOnScroll]="true" [zoomOnPinch]="true" [zoomOnDoubleClick]="true" />
```

# Embedded editor configuration

Scroll to navigate, pinch to zoom, and use an explicitly configured Space shortcut to temporarily enable drag panning:

```html
<vflow [nodes]="nodes" [panOnDrag]="false" [panOnScroll]="true" [keyboardShortcuts]="shortcuts" [nodeDragThreshold]="3" [connectionDragThreshold]="3" />
```

This configuration consumes ordinary scrolling over the flow. For an editor embedded in a scrolling page where scrolling should navigate the page, disable both `panOnScroll` and `zoomOnScroll` and leave their activation shortcuts disabled. Pinch can remain enabled independently.

# Embedded controls

Import the standalone `NoDragDirective`, `NoPanDirective`, and `NoWheelDirective`, or use the `Vflow` imports array, which includes all three.

```html
<!-- Inside a node template: retain text editing and the textarea's own scrolling. -->
<textarea vflowNoDrag vflowNoWheel></textarea>

<!-- Prevent viewport panning from an overlay and its descendants. -->
<div vflowNoPan>...</div>
```

Each directive applies to its element and descendants:

- `vflowNoDrag` prevents node dragging and viewport panning.
- `vflowNoPan` prevents viewport panning, including scroll panning; node dragging and zoom are unaffected.
- `vflowNoWheel` leaves wheel events, including trackpad pinch, to the browser/control. It does not block touchscreen gestures; combine it with `vflowNoDrag` for scrollable controls inside draggable nodes.

**Major-release migration:** replace `class="nodrag"` with `vflowNoDrag` and import the directive or `Vflow`. The old class no longer disables gestures. Built-in resize controls already use the directive.

# Page scrolling

Wheel zoom suppresses page scrolling when it consumes an event. A new outward wheel gesture at a reached zoom limit can scroll the page. Scroll panning consumes its events. Disabled wheel gestures and `vflowNoWheel` leave native scrolling available. There is no separate `preventScrolling` setting.

Accepted touch pan/zoom gestures suppress native scrolling. Disabled gestures and opted-out controls do not have their touch movement unconditionally cancelled by the flow. Application CSS such as `touch-action: none` on an ancestor can still prevent native scrolling.

# Disable all user viewport gestures

```html
<vflow [nodes]="nodes" [panOnDrag]="false" [panOnScroll]="false" [zoomOnScroll]="false" [zoomOnPinch]="false" [zoomOnDoubleClick]="false" [keyboardShortcuts]="{ pan: null, zoom: null }" />
```

Explicit `panTo`, `zoomTo`, `viewportTo`, and `fitView` calls continue to work. These settings only control viewport gestures; configure node dragging and selection separately if needed.

# Auto-pan during dragging

`autoPan` accepts a boolean or `AutoPanSettings`. The default `true` enables auto-pan for node dragging, connection creation, and reconnection; `false` disables all three.

```html
<vflow [nodes]="nodes" [autoPan]="{ nodeDrag: true, connectionDrag: false, speed: 600, margin: 48 }" />
```

| Option           | Default | Meaning                                                                                             |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `nodeDrag`       | `true`  | Auto-pan while dragging nodes.                                                                      |
| `connectionDrag` | `true`  | Auto-pan while creating or reconnecting an edge.                                                    |
| `speed`          | `600`   | Maximum speed per axis in viewport pixels per second, independent of zoom and display refresh rate. |
| `margin`         | `48`    | Distance from each viewport edge, in pixels, where auto-pan starts.                                 |

Speed and margin are shared by both operations. Movement accelerates quadratically toward an edge; at half the margin, speed is one quarter of the maximum. The default speed approximates the previous behavior at 60 Hz.

Omitted fields use their defaults. Setting either `speed` or `margin` to zero disables auto-pan. Negative numbers, `NaN`, and infinities fall back to the corresponding default and produce a warning in development mode.

Settings are captured when the editor is created. Updating the input or mutating its options afterward has no effect; recreate the editor to apply different settings. Auto-pan for selection and keyboard focus is not supported.
