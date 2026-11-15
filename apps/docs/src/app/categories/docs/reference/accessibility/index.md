What the flow exposes to assistive technology, what its keyboard commands do, and the labels it reads out.

## Roles and names

| Element | Role and name                                                                                                           | Description                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Flow    | `region` named `flowLabel`, `Graph` by default                                                                          | `flowDescription`                                                                                                 |
| Node    | `group` named by `ariaLabel`, else `Node {id}`; read as a `node`, or a `group` while other nodes reference it as parent | `ariaDescription`, the parent's name, `Selected.`, unavailable interactions, key instructions                     |
| Edge    | `group` named by `ariaLabel`, else `Connection from {source} to {target}`                                               | `ariaDescription`, the endpoints when the name is custom, `Selected.`, unavailable interactions, key instructions |
| Minimap | `img` named `minimapLabel`, `Graph minimap` by default                                                                  |                                                                                                                   |
| Handle  | none: transparent to assistive technology                                                                               |                                                                                                                   |

- The tree is flat: a child names its parent in its description and is not nested inside it. The preview nodes of
  the minimap are not exposed.
- Restrictions are described per interaction (`Selection unavailable.`, `Movement unavailable.`), never as
  `aria-disabled` on the wrapper.
- Library geometry, markers and the connection line are hidden from assistive technology.

## Entity metadata

`ariaLabel`, `ariaDescription` and `domAttributes` are optional writable signals on `Node` and `Edge`.

| Field             | Description                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ariaLabel`       | The accessible name. Without it, `Node {id}` or `Connection from {source} to {target}`                                                                      |
| `ariaDescription` | Added to the description, before the state and the instructions                                                                                             |
| `domAttributes`   | `data-*`, `title`, `lang` and `dir`, set on the library wrapper. Roles, ARIA state, ids, focus and event handlers are library-owned; other keys are ignored |

A handle takes only `domAttributes`.

## Focus order

- `Tab` and `Shift+Tab` visit focusable nodes in `nodes` order, then edges in `edges` order, and leave the graph.
- Focus and selection are independent: focus never changes selection by itself.
- Nothing takes focus on page load. The graph container is not a focus target, so a click on the empty pane does not
  take focus.
- When the focused entity is removed or stops being focusable, focus returns to the page. It does not move to
  another node or edge.
- A node that receives keyboard focus while fully offscreen is centered at the current zoom, unless
  `autoPanOnNodeFocus` is `false`. Edges and arrow movement never pan.
- `nodesFocusable`, `edgesFocusable` and the `focusable` signal of an entity remove Tab stops; embedded controls are
  not affected.
- With virtualization enabled, hidden entities are skipped by Tab and by focus recovery.

## Commands

The keys are listed in the [Keyboard shortcuts reference](/docs/reference/keyboard-shortcuts#default-commands).

- **Select** replaces the selection with the focused entity, or toggles it while the multiselection modifier is held. **Clear selection** empties it and keeps focus. Neither writes selection in `selectionMode="manual"`, and an entity with `selectable: false` can be deselected but not selected.
- **Move** shifts every selected movable node by 5 flow units, 20 with Shift, or one grid cell, four with Shift, on an axis where `snapGrid` is above 1. The focused node must itself be selected and movable. Parent extents and snapping apply, position signals update and the usual position notifications fire.
- **Delete** emits `(deleteRequest)` with `{ nodeIds, edgeIds }`: the whole selection when the focused entity is selected, otherwise only the focused entity. The library removes nothing.
- **Pan, zoom in, zoom out and fit view** run from a focused entity. Arrows pan only when they do not move a node.

Keys pressed inside inputs, textareas, selects, contenteditable regions and buttons never run graph commands;
`vNoKeyboard` on an element does the same for its subtree.

## Instructions

Each focusable node and edge carries one instruction in its description, written from the keys bound at that moment
and naming only the commands that work for it:

```text
Press Enter or Space to select. Use arrow keys to move it while it is selected. Press Delete or Backspace to delete.
```

## Announcements

A command that changes state reports it in the flow's own polite live region: `Draft selected. 1 selected in total.`,
`Selection cleared.`, `Moved node right. Position: 25, 20.`, `Zoom 120%.`. Panning is silent, and so are pointer and
programmatic changes. There is no public API for announcing other messages.

## Labels

`AriaLabelConfig`, provided as a `Partial` with `withAccessibility()`. Omitted keys keep their English defaults,
exported as `DEFAULT_ARIA_LABEL_CONFIG`. Names and descriptions update as soon as the labels or the entity metadata
change.

| Key                                           | Default                                                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flowLabel`, `flowDescription`                | `Graph`, empty                                                                                                                                                |
| `minimapLabel`                                | `Graph minimap`                                                                                                                                               |
| `nodeLabel`                                   | `(id) => 'Node {id}'`                                                                                                                                         |
| `edgeLabel`                                   | `({ source, target }) => 'Connection from {source} to {target}'`                                                                                              |
| `nodeRole`, `parentRole`, `edgeRole`          | `node`, `group`, `edge`: the `aria-roledescription` a screen reader says instead of the role; `parentRole` is for a node that other nodes reference as parent |
| `parentDescription`                           | `(parent) => 'Parent: {parent}.'`                                                                                                                             |
| `selected`                                    | `Selected.`                                                                                                                                                   |
| `selectionUnavailable`, `movementUnavailable` | `Selection unavailable.`, `Movement unavailable.`                                                                                                             |
| `nodeInstructions`, `edgeInstructions`        | `(keys, state) => string`, the instruction sentences above                                                                                                    |
| `selectionAnnouncement`                       | `({ label, selected, count }) => '{label} selected. {count} selected in total.'`                                                                              |
| `selectionClearedAnnouncement`                | `Selection cleared.`                                                                                                                                          |
| `movedAnnouncement`                           | `({ count, direction, x, y }) => 'Moved node {direction}. Position: {x}, {y}.'`                                                                               |
| `zoomAnnouncement`                            | `(zoom) => 'Zoom {percent}%.'`                                                                                                                                |

Formatters receive and return plain text. `nodeInstructions` and `edgeInstructions` are either a sentence or a
function of the keys bound at that moment and of what the entity can do.

`keys` carries `select`, `clearSelection`, `delete`, `move`, `pan`, `zoomIn`, `zoomOut`, `fitView` and `multiSelection`, each already formatted as a phrase such as `Enter or Space`, with modifiers spelled as words; a disabled command is an empty string. `state.selectable` is false for an unselectable entity and in `selectionMode="manual"`; `state.movable` is true for a draggable node that is selectable or already selected. Key names are English; a translation that wants its own words for them passes a plain string, which then stays fixed whatever the keys are.

## Focus indicator

| Token              | Styles                                                                |
| ------------------ | --------------------------------------------------------------------- |
| `--v-focus`        | Color of the halo                                                     |
| `--v-focus-halo`   | How far the halo reaches beyond the node and to each side of the edge |
| `--v-focus-radius` | Corner radius of the focused node                                     |

- The halo is drawn around the node wrapper and along the edge path, under the content.
- It is part of the zoomed content and scales with it.
- Its tint is stronger under a dark `color-scheme`.
- Under `forced-colors: active` the halo is opaque, and on nodes it is an outline just outside the handles.

## Not supported

- Handles are not exposed and cannot be operated from the keyboard: creating and reconnecting edges needs a pointer.
- Resize controls are pointer-only.
- The minimap has no Tab stop.

## See also

- [Accessibility](/docs/interactions/accessibility) for the tasks.
- [Accessibility model](/docs/concepts/accessibility) for the reasons behind these rules.
