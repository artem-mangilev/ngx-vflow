This guide shows how to make a graph usable with a keyboard and a screen reader: naming its nodes and edges,
handling keyboard deletion, translating the labels and styling focus. What the flow renders and announces is listed
at the end of this page.

## Name nodes and edges

The library does not read names out of your templates, and the fallback name is the id. Give every domain node an
`ariaLabel`, and an `ariaDescription` where its state matters:

```typescript
import { createNodes, createEdges } from 'ngx-vflow';

const nodes = createNodes([
  {
    id: 'request',
    point: { x: 20, y: 40 },
    ariaLabel: 'Expense request',
    ariaDescription: 'Requires approval.',
    domAttributes: { 'data-record': 'request', lang: 'en' },
  },
  { id: 'approval', point: { x: 250, y: 40 }, ariaLabel: 'Approval' },
]);
const edges = createEdges([{ id: 'review', source: 'request', target: 'approval', ariaLabel: 'Review route' }]);

nodes[0].ariaDescription!.set('Ready for approval.');
```

To mark the wrapper of a node, an edge or a handle for your CSS or your tests, pass `data-*`, `title`, `lang` or
`dir` in `domAttributes`:

```html
<span vHandle handleType="target" position="left" handleId="incoming" [domAttributes]="{ 'data-port': 'review' }"></span>
```

## Name the graph

Set `flowLabel`, and `flowDescription` if the graph needs one, with `withAccessibility()`:

```typescript
provideVflow(withAccessibility({ flowLabel: 'Approval graph' }));
```

## Label the controls inside nodes

Controls inside your templates keep their own semantics. Give your buttons, inputs and edge-label controls labels
and keyboard behavior as you would anywhere else, and mark your own decorative SVG `aria-hidden="true"`.

## Apply deletion from the keyboard

`Delete` and `Backspace` on a focused node or edge emit `(deleteRequest)`; the library removes nothing. Apply the
request to your collections:

```html
<vflow [nodes]="nodes" [edges]="edges" (deleteRequest)="onDeleteRequest($event)" />
```

```typescript
onDeleteRequest(request: DeleteRequest) {
  const result = removeElements(request, { nodes: this.nodes, edges: this.edges });
  this.nodes = result.nodes;
  this.edges = result.edges;
}
```

## Translate the labels

Provide a `Partial<AriaLabelConfig>` with `withAccessibility()` inside `provideVflow()`. Put it into the providers
of `bootstrapApplication` for the whole application, or of a route or the component that hosts the flow; a closer
`withAccessibility()` adds its keys to one further up.

```typescript
const labels: Partial<AriaLabelConfig> = {
  flowLabel: 'Граф согласования',
  selected: 'Выбран.',
  parentDescription: (parent) => `Родитель: ${parent}.`,
  edgeLabel: ({ source, target }) => `Связь от ${source} к ${target}`,
};
```

```typescript
@Component({
  providers: [provideVflow(withAccessibility(labels))],
  ...
})
```

If the labels come from a translation service and must follow a change of language, pass a factory that returns
them or a signal of them:

```typescript
provideVflow(withAccessibility(() => inject(TranslocoService).selectTranslateObject('vflow')));
```

## Write your own key instructions

To reword the instruction sentence of a node or an edge, give `nodeInstructions` or `edgeInstructions` a function.
It receives the keys bound at that moment and what the entity can do, so the sentence follows a remap and never
names a command that is unavailable:

```typescript
const labels: Partial<AriaLabelConfig> = {
  nodeInstructions: ({ select, move, delete: remove }, { selectable, movable }) => [selectable && select ? `Нажмите ${select} для выбора.` : '', movable && move ? `Перемещайте выбранный узел: ${move}.` : '', remove ? `Нажмите ${remove} для удаления.` : ''].filter(Boolean).join(' '),
};
```

If a translation wants its own words for the keys, pass a plain string instead; it then stays fixed whatever the
keys are.

## Style the focus indicator

Set `--v-focus`, `--v-focus-halo` and `--v-focus-radius` on the flow element. To give one kind of node its own
shape, set the token per node from a global stylesheet, since the halo is drawn on the wrapper around your template:

```css
[data-v-node][data-shape='pill'] {
  --v-focus-radius: 999px;
}
```

## Take entities out of the Tab order

- To remove all nodes or all edges, set `[nodesFocusable]="false"` or `[edgesFocusable]="false"`.
- To remove one entity, set its `focusable` signal to `false`.
- To keep the view still when focus moves to an offscreen node, set `[autoPanOnNodeFocus]="false"`.

## Keep typing inside a node from running commands

Inputs, textareas, selects, contenteditable regions and buttons already keep their keys. For any other area, such
as an editor inside a node, add `vNoKeyboard` to its element.

## Keep every entity reachable with virtualization

Virtualization hides offscreen entities, and Tab skips them. Leave it off where every entity must be reachable by
keyboard.

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

The keys are listed in [Keyboard shortcuts](/docs/interactions/keyboard-shortcuts#default-commands).

- **Select** replaces the selection with the focused entity, or toggles it while the multiselection modifier is held. **Clear selection** empties it and keeps focus. Neither writes selection in `selectionMode="manual"`, and an entity with `selectable: false` can be deselected but not selected.
- **Move** shifts every selected movable node by 5 flow units, 20 with Shift, or one grid cell, four with Shift, on an axis where `snapGrid` is above 1. The focused node must itself be selected and movable. Parent extents and snapping apply, position signals update and the usual position notifications fire.
- **Delete** emits `(deleteRequest)` with `{ nodeIds, edgeIds }`: the whole selection when the focused entity is selected, otherwise only the focused entity. The library removes nothing.
- **Pan, zoom in, zoom out and fit view** run from a focused entity. Arrows pan only when they do not move a node.

Keys pressed inside inputs, textareas, selects, contenteditable regions and buttons never run graph commands;
`vNoKeyboard` on an element does the same for its subtree.

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

## Not supported

- Handles are not exposed and cannot be operated from the keyboard: creating and reconnecting edges needs a pointer.
  An application that needs it offers its own control, for example a "connect to…" menu on a node that adds the
  edge with [graph operations](/docs/graph/graph-operations).
- Resize controls are pointer-only.
- The minimap has no Tab stop.
