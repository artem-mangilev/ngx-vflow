Nodes and edges can be selected!

1. A click on a node presentation selects the node, and a click on an edge presentation selects the edge. No directive is needed.
2. A press that turns into a drag, a resize, a pan or a selection box does not select the entity under the pointer.
3. To keep a click on an embedded control from selecting its entity, mark the control with `vNoSelect`, like the gesture exclusions `vNoDrag` and `vNoPan`. In the demo below the button inside the custom node carries it.

An edge is clickable along its whole path: the flow draws a transparent stroke of `interactionWidth` (20px by default) in the edge host. A `<svg:g vEdgeInteraction>` around the presentation moves the stroke inside the group, where the group's CSS `:hover` and listeners see it.

Selected nodes and edges are raised above their neighbours while `elevateNodesOnSelect` and `elevateEdgesOnSelect` are on (the default), whether the selection came from a click, the keyboard, the selection box or the application.

> Both custom nodes and edges have the `selected()` signal in their template context for applying styles based on this state.

### Capability policy

Selection eligibility is resolved independently for nodes and edges. The library defaults all capabilities to `true`:

- `nodesSelectable` and `edgesSelectable` are the global selection defaults.
- `nodesFocusable` and `edgesFocusable` are the global focus defaults for focus behavior added by later interaction features.
- An entity's `selectable` or `focusable` signal overrides its corresponding global setting. Explicit `true` and `false` both override; an omitted field inherits.

These policies gate library-originated interactions only. The application still owns the entity collection and may write `selected` or remove entities directly.

Selection and deselection are separate: making an entity non-selectable does not clear its existing `selected` signal, and pane clicks or replace-selection may still deselect it.

The former `[entitiesSelectable]` input was removed in v3. Use `[nodesSelectable]`, `[edgesSelectable]`, and `[keyboardShortcuts]="{ modifiers: { selection: [] } }"` as needed.

### Manual selection

`[selectionMode]="'manual'"` is a different switch: the flow then never writes `selected`. Clicks, the selection box, the keyboard and pane clicks change nothing, and the application sets `selected` itself, for example from its own click handlers. With `selectable: false` the flow still clears the selection on a pane click or when another entity is selected; with `manual` it does not.

{{ NgDocActions.demoPane("SelectingDemoComponent") }}
