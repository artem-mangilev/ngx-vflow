This guide shows how to set up the way users pan and zoom a flow: the gestures, the keys that enable them, and the
controls inside nodes that must keep their own behavior. Every setting with its default is in the
[Viewport reference](/docs/reference/viewport).

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
