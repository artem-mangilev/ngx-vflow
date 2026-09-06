The library includes a minimap that offers an overview of the entire flow. To enable it, simply add a `<mini-map />` component as a direct child of `<vflow />`. For customization options, see the available inputs in `MiniMapComponent`.

The minimap uses canvas and caches node previews during pan and zoom. It updates the previews when node geometry or selection changes, and keeps the image sharp on high-DPI displays.

Navigation is opt-in; `<mini-map />` remains a read-only overview.

```html
<vflow [nodes]="nodes" [edges]="edges">
  <mini-map [pannable]="true" [zoomable]="true" [zoomStep]="0.1" />
</vflow>
```

- `pannable` enables click/tap, mouse drag, single-finger touch drag, and scroll panning. Clicking centers the main viewport on the chosen point without changing zoom. Dragging its visible area preserves the grab offset; dragging elsewhere centers first and then follows the pointer. The main flow's `paneClickDistance` distinguishes a click from a drag, in client-space CSS pixels.
- `zoomable` enables wheel and trackpad pinch zoom around the main viewport center. `zoomStep` defaults to `0.1`: each wheel event multiplies or divides zoom by `1.1`, according to scroll direction. Non-positive or non-finite values fall back to `0.1`. Zoom respects the main flow's `minZoom` and `maxZoom`.
- Both switches default to `false` and additionally respect the main flow's gesture settings. `panOnDrag` and its permitted mouse buttons control dragging and clicking; the pan activation key can enable these gestures. Selection activation takes priority over panning. `panOnScroll` or the pan activation key routes ordinary scrolling to pan, unless the zoom activation key is held. `zoomOnScroll` or the zoom activation key enables wheel zoom; `zoomOnPinch` controls trackpad pinch. The minimap switches must still be enabled.

An opted-in minimap captures pointer input only inside its own rectangle and suppresses wheel page scrolling there, including at zoom limits or when a main-flow gesture is disabled. The surrounding pane remains interactive. A drag continues outside the minimap using pointer capture; pointer cancellation, lost capture, window blur, or disabling `pannable` ends it. Main pan-policy changes are checked on the next pointer event. Wheel input during a pointer drag is ignored.

Two-finger touchscreen pinch, minimap keyboard navigation, and viewport translation bounds are not included. Per-node presentation hooks are planned separately.

{{ NgDocActions.demoPane("MinimapDemoComponent") }}
