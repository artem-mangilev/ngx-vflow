A click selects a node or an edge, and a box dragged over the canvas selects several at once.

## Selection by click

1. A click on a node presentation selects the node, and a click on an edge presentation selects the edge. No directive is needed.
2. A press that turns into a drag, a resize, a pan or a selection box does not select the entity under the pointer.
3. To keep a click on an embedded control from selecting its entity, mark the control with `vNoSelect`, like the gesture exclusions `vNoDrag` and `vNoPan`. In the demo below the Approve button of the Review node carries it: a click on it counts an approval and leaves the selection as it is, while a click anywhere else on the card selects the node.

An edge is clickable along its whole path: the flow draws a transparent stroke of `interactionWidth` (20px by default). When the edge template starts with a `<svg:g>`, or a component draws the edge, the stroke sits inside that group, where the group's CSS `:hover` and listeners see it; otherwise it sits in the edge host. The stroke shows the pointer cursor only while the edge can be selected.

Selected nodes and edges are raised above their neighbours while `elevateNodesOnSelect` and `elevateEdgesOnSelect` are on (the default), whether the selection came from a click, the keyboard, the selection box or the application.

> Both custom nodes and edges have the `selected()` signal in their template context for applying styles based on this state. The Review node of the demo prints it in its header.

## What can be selected

Selection eligibility is resolved independently for nodes and edges. The library defaults all capabilities to `true`:

- `nodesSelectable` and `edgesSelectable` are the global selection defaults.
- `nodesFocusable` and `edgesFocusable` are the global focus defaults for focus behavior added by later interaction features.
- An entity's `selectable` or `focusable` signal overrides its corresponding global setting. Explicit `true` and `false` both override; an omitted field inherits.

These policies gate library-originated interactions only. The application still owns the entity collection and may write `selected` or remove entities directly.

Selection and deselection are separate: making an entity non-selectable does not clear its existing `selected` signal, and pane clicks or replace-selection may still deselect it.

## Manual selection

`[selectionMode]="'manual'"` is a different switch: the flow then never writes `selected`. Clicks, the selection box, the keyboard and pane clicks change nothing, and the application sets `selected` itself, for example from its own click handlers. With `selectable: false` the flow still clears the selection on a pane click or when another entity is selected; with `manual` it does not. It is the counterpart of a controlled flow in React Flow whose `onNodesChange` drops the `select` changes.

{{ NgDocActions.demoPane("SelectingDemoComponent") }}

## Selection box

The selection box selects several nodes and edges by dragging over the canvas.

### Activation

Hold `Shift` (default `selection` shortcut) and drag on empty canvas space to start box selection.

If you need to remap this shortcut, see [Keyboard shortcuts](/docs/interactions/keyboard-shortcuts).

### Configuration

Use the `[selectionBoxMode]` input, or `selectionBoxMode` in `withSettings()`:

```html
<vflow selectionBoxMode="partial" [nodes]="nodes" [edges]="edges" />
```

- `'full'` (default) selects only entities fully enclosed by the box.
- `'partial'` selects entities that intersect the box.

The color of the box is the core token `--v-selection-box`: its stroke, and its fill at 12%.

To disable the selection-box gesture, provide `withShortcuts({ modifiers: { selection: [] } })` in `provideVflow()`, see [Keyboard shortcuts](/docs/interactions/keyboard-shortcuts).

### Selection semantics

- During drag, entities are marked as preselected.
- On pointer release, preselected entities become selected.
- If `multiSelection` is not active, previous selection is cleared before applying box selection results.
- For edges, `full`/`partial` checks are based on source/target handle points, not by edge curve path intersection.

### Template state access

The `preselected` state is also exposed in rendering contexts, so custom templates can style the drag-preview state differently from the final selected state.

- Node template contexts expose `preselected` together with `selected`.
- Component nodes read the same `preselected` signal from `injectNode()`.
- Edge template context also exposes `preselected`, so custom edges can render preselection state explicitly.

In this demo, switch the mode between `full` and `partial`, then hold `Shift` and drag a box that covers some nodes whole and only touches others.

{{ NgDocActions.demoPane("SelectionBoxDemoComponent") }}
