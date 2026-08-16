Nodes and edges can be selected!

1. Default nodes and edges are selectable by default; just click and see that one is selected.
2. Custom nodes and edges are not selectable by default, you need to mark the element that triggers selection with the `selectable` directive.

> Both custom nodes and edges have the `selected()` signal in their template context for applying styles based on this state.

### Capability policy

Selection eligibility is resolved independently for nodes and edges. The library defaults all capabilities to `true`:

- `nodesSelectable` and `edgesSelectable` are the global selection defaults.
- `nodesFocusable` and `edgesFocusable` are the global focus defaults for focus behavior added by later interaction features.
- An entity's `selectable`, `focusable`, or `deletable` signal overrides its corresponding global setting. Explicit `true` and `false` both override; an omitted field inherits.
- `deletable` has no global input and defaults to `true`.

These policies gate library-originated interactions only. The application still owns the entity collection and may write `selected` or remove entities directly.

Selection and deselection are separate: making an entity non-selectable does not clear its existing `selected` signal, and pane clicks or replace-selection may still deselect it.

The former `[entitiesSelectable]` input was removed in v3. Use `[nodesSelectable]`, `[edgesSelectable]`, and `[keyboardShortcuts]="{ selection: null }"` as needed.

{{ NgDocActions.demoPane("SelectingDemoComponent") }}
