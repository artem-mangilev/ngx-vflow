# Make viewport gesture policy configurable

Status: resolved
Tier: critical-parity
Depends on: —

## Problem

Pan and zoom work, but most input policy is hard-coded in the D3 integration. Embedding a flow inside a complex application requires control over wheel, pinch, drag, double-click, scroll, mouse buttons, thresholds, and page scrolling.

## Required behavior

- Add public settings for wheel zoom, pinch zoom, double-click zoom, drag panning, and scroll panning.
- Allow callers to choose pan mouse buttons and optional activation keys.
- Add configurable click/drag and connection-drag thresholds where gesture ambiguity exists.
- Define whether and when the flow prevents page scrolling.
- Provide supported no-pan, no-drag, and no-wheel escape mechanisms for controls embedded in nodes and overlays.
- Preserve current behavior as the compatibility default unless a deliberate migration is documented.

## Acceptance

- Every supported gesture can be independently enabled or disabled.
- Disabling all five gesture settings and setting `keyboardShortcuts.pan` and `keyboardShortcuts.zoom` to `null` disables all user-initiated viewport pan/zoom while preserving programmatic viewport operations.
- Embedded inputs and scrollable controls can opt out without private CSS knowledge.
- Mouse, trackpad, and touch behavior is covered by focused tests.
- Programmatic viewport changes remain available regardless of gesture settings.
- Public documentation includes common canvas-style and embedded-editor configurations.

## Out of scope

- Full touch gesture expansion beyond existing pan/zoom paths.
- Viewport translation bounds and operation-specific auto-pan.
- A ready-made Controls component.

## Comments

### Design session — 2026-09-05

Agreed:

- When scroll panning and wheel zoom are both enabled, ordinary scrolling pans the viewport. Holding the zoom activation key temporarily switches scrolling to zoom. Pinch remains controlled independently. Follow React Flow's priority model; example zoom bindings use Cmd on macOS and Ctrl elsewhere.
- The pan activation key does not override dragging a draggable node or explicit no-pan regions. Preserve node dragging when the gesture starts on a draggable node.
- Configure all activation hotkeys through the existing `KeyboardShortcuts` API rather than adding separate key inputs. Keep its name and keyboard-only scope; add `pan` and `zoom` actions, preserving alternative `event.code` arrays and `null` to disable. Mouse buttons and gesture settings remain separate.
- Preserve existing gesture defaults, including all-button viewport panning and disabled double-click zoom. New activation shortcuts are opt-in; Space and OS-specific Cmd/Ctrl are example bindings rather than newly enabled defaults.
- The default `null` pan/zoom shortcuts disable only keyboard activation, not ordinary viewport gestures. Configured activation keys can temporarily enable pan/zoom even when the corresponding ordinary gesture is disabled. To disable user-initiated viewport pan/zoom completely, disable drag panning, scroll panning, wheel zoom, pinch zoom, and double-click zoom, and set both activation shortcuts to `null`. Include this configuration in documentation and test it alongside programmatic viewport operations.
- Provide public Angular directives `vflowNoDrag`, `vflowNoPan`, and `vflowNoWheel`, applying to the marked element and its descendants. No-drag blocks node dragging and viewport panning; no-pan blocks viewport panning; no-wheel blocks flow handling of wheel events, including trackpad pinch. Remove the existing `.nodrag` escape mechanism in this major release and migrate internal uses, examples, and documentation to the directive. Document the migration for consumers.
- Expose the existing viewport click tolerance and add node-drag and connection-drag activation thresholds. New activation thresholds default to zero to preserve immediate initiation; positive values delay the interaction and its start events until the pointer passes the threshold. Distances use client-space CSS pixels, independent of viewport zoom. Selection-box minimum size is outside this issue.
- Mid-gesture setting/key changes do not require a bespoke interruption or snapshot mechanism. Use the simplest behavior supported by the existing gesture integration and document/test the resulting contract.

- Explicit keyboard selection takes priority over viewport drag panning; `multiSelection` remains independent. New `pan` and `zoom` shortcuts do not activate from text inputs, textareas, or contenteditable regions, including modified keystrokes. Clear pressed-key state when the window loses focus.
- Preserve current page-scroll behavior by default; do not add a separate `preventScrolling` mode. Wheel events consumed by viewport zoom suppress page scrolling; a new outward wheel gesture at a reached zoom limit can scroll the page. Preserve default touch pan/zoom handling, while disabled gestures and opt-out directives must permit embedded controls to work without unconditional root-level cancellation defeating the opt-out.

Implementation and verification notes:

- Keep programmatic `viewportTo`, `zoomTo`, `panTo`, and `fitView` independent of gesture settings.
- Cover gesture toggles, scroll-versus-zoom priority, keyboard selection priority, draggable-node protection, descendant opt-outs, editable targets, and blur reset with focused observable-behavior tests.
- Verify threshold behavior at non-unit zoom, including no start event before a positive threshold and immediate initiation at zero. Retain the existing click tolerance default of 6; leave selection-box size unchanged.
- Exercise mouse, wheel/trackpad, and existing touch paths, including native scrolling inside opted-out controls. Document both a canvas configuration and an embedded-editor configuration, opt-in activation shortcuts, and the `.nodrag` migration.
- Shared understanding confirmed by the user after clarifying ordinary gesture defaults versus optional activation shortcuts and the complete gesture-disable configuration. The design session is complete and this issue is ready for implementation.

References: [React Flow viewport controls](https://reactflow.dev/learn/concepts/the-viewport), [wheel routing](https://github.com/xyflow/xyflow/blob/main/packages/system/src/xypanzoom/XYPanZoom.ts), [pan activation](https://github.com/xyflow/xyflow/blob/main/packages/react/src/container/FlowRenderer/index.tsx), [gesture filter](https://github.com/xyflow/xyflow/blob/main/packages/system/src/xypanzoom/filter.ts).

## Answer

Resolved on 2026-09-05.

- Added public `panOnDrag`, `panOnScroll`, `zoomOnScroll`, `zoomOnPinch`, `zoomOnDoubleClick`, `paneClickDistance`, `nodeDragThreshold`, and `connectionDragThreshold` inputs and matching testing mocks.
- Added opt-in `KeyboardShortcuts.pan` and `.zoom`, preserving ordinary gesture defaults, alternative key semantics, selection priority, editable-target protection, and blur reset. Mouse-button arrays remain restrictions even with pan activation held.
- Added and exported `vflowNoDrag`, `vflowNoPan`, and `vflowNoWheel` directives, included them in `Vflow`, and migrated resize controls off `.nodrag`. Removed unconditional touch cancellation and ancestor drag touch-action blocking so opted-out controls can retain native scrolling.
- Applied activation thresholds at the shared node drag and connection/reconnection entry points. Below-threshold node movement retains click handling; crossing the threshold preserves the start notification.
- Documented gesture priorities, defaults, canvas/embedded-editor examples, complete gesture disabling, and the major-release `.nodrag` migration on the new Viewport gestures page.
- Verified: 128 ChromeHeadless library tests; library and demo lint; packaged library/testing build; documentation demo development build.
