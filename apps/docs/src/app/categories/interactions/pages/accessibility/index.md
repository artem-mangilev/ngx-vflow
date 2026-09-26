The graph can be read and operated without a pointer. The flow is a named region, every node and edge is a named `group` whose state sits in its description, and keyboard commands report what they did in a live region. The example mirrors as text what a screen reader receives: the name and description of the focused entity, and the last announcement. Switch its language to watch the labels follow.

{{ NgDocActions.demoPane("AccessibilityDemoComponent") }}

## What the library renders

| Element | Role and name                                                                                                           | Description                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Flow    | `region` named `flowLabel`, `Graph` by default                                                                          | `flowDescription`                                                                                                 |
| Node    | `group` named by `ariaLabel`, else `Node {id}`; read as a `node`, or a `group` while other nodes reference it as parent | `ariaDescription`, the parent's name, `Selected.`, unavailable interactions, key instructions                     |
| Edge    | `group` named by `ariaLabel`, else `Connection from {source} to {target}`                                               | `ariaDescription`, the endpoints when the name is custom, `Selected.`, unavailable interactions, key instructions |
| Minimap | `img` named `minimapLabel`, `Graph minimap` by default                                                                  |                                                                                                                   |
| Handle  | none: transparent to assistive technology                                                                               |                                                                                                                   |

The tree is flat: a child names its parent in its description instead of nesting inside it, and the minimap's preview nodes do not form a second graph. Restrictions are described per interaction (`Selection unavailable.`, `Movement unavailable.`) and never as `aria-disabled` on the wrapper, so buttons and inputs inside a node stay operable. Library geometry, markers and the connection line are hidden from assistive technology; mark your own decorative SVG `aria-hidden="true"` the same way.

## Naming nodes and edges

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

`ariaLabel`, `ariaDescription` and `domAttributes` are optional writable signals on `Node` and `Edge`. The library does not read names out of your templates, so give domain nodes a name; the fallback is the id. `domAttributes` accepts `data-*`, `title`, `lang` and `dir` and lands on the library wrapper; roles, ARIA state, ids, focus and event handlers stay library-owned, and other keys are ignored. A handle takes only `domAttributes`:

```html
<span vflowHandle handleType="target" position="left" handleId="incoming" [domAttributes]="{ 'data-port': 'review' }"></span>
```

Controls inside your templates keep their own semantics. Give custom buttons, inputs and edge-label controls labels and keyboard behavior as you would anywhere else; the library keeps them reachable, including inside resizable wrappers.

## Keyboard

`Tab` and `Shift+Tab` visit focusable nodes in `nodes` order, then edges in `edges` order, and leave the graph normally. Focus and selection are independent: focus has its own indicator and never changes selection by itself. Each focusable node and edge carries one short instruction in its description, written from the keys bound at that moment and naming only the commands that work for it:

```text
Press Enter or Space to select. Use arrow keys to move it while it is selected. Press Delete or Backspace to delete.
```

The keys are listed on [Keyboard shortcuts](../keyboard-shortcuts); this is what the commands do.

- **Select** replaces the selection with the focused entity, or toggles it while the multiselection modifier is held. **Clear selection** empties it and keeps focus. Neither writes selection in `selectionMode="manual"`, and an entity with `selectable: false` can be deselected but not selected.
- **Move** shifts every selected movable node by 5 flow units, 20 with Shift, or one grid cell, four with Shift, on an axis where `snapGrid` is above 1. The focused node must itself be selected and movable. Parent extents and snapping apply, position signals update and the usual position notifications fire.
- **Delete** emits `(deleteRequest)` with `{ nodeIds, edgeIds }`: the whole selection when the focused entity is selected, otherwise only the focused entity. The library removes nothing.
- **Pan, zoom in, zoom out and fit view** run from a focused entity and from the graph container. Arrows pan only when they do not move a node.

```html
<vflow [nodes]="nodes" [edges]="edges" (deleteRequest)="onDeleteRequest($event)" />
```

```typescript
onDeleteRequest({ nodeIds, edgeIds }: DeleteRequest) {
  const result = removeNodes(nodeIds, { nodes: this.nodes, edges: removeEdges(edgeIds, this.edges) });
  this.nodes = result.nodes;
  this.edges = result.edges;
}
```

A command that changes state reports it in the flow's own polite live region: `Draft selected. 1 selected in total.`, `Selection cleared.`, `Moved node right. Position: 25, 20.`, `Zoom 120%.`. Panning is silent, and so are pointer and programmatic changes. There is no public API for announcing your own messages.

**Focus recovery.** When the focused entity is removed or stops being focusable, focus moves to the next entity, then the previous one, then the graph container. Nothing takes focus on page load.

**Focus pan.** A node that receives keyboard focus while fully offscreen is centered at the current zoom. `[autoPanOnNodeFocus]="false"` turns this off; edges and arrow movement never pan.

**Opting out.** `nodesFocusable`, `edgesFocusable` and the per-entity `focusable` override remove Tab stops without affecting embedded controls. Keys pressed inside inputs, textareas, selects, contenteditable regions and buttons never run graph commands; `vflowNoKeyboard` on an element does the same for a whole area. With virtualization enabled, hidden entities are skipped by Tab and by focus recovery, so disable it where every entity must be reachable by keyboard.

## Focus ring

Focus is drawn as a ring around the node wrapper, a dashed halo along the edge path and an inner border on the graph container. Four tokens style it: `--vflow-focus` for the color, `--vflow-focus-width`, `--vflow-focus-offset` and `--vflow-focus-radius`. The ring stays the same size on screen at every zoom. It is drawn on the wrapper around your template, so set the tokens on the flow element, or per node from a global stylesheet:

```css
.vflow-node[data-shape='pill'] {
  --vflow-focus-radius: 999px;
}
```

## Localization

Bind a `Partial<AriaLabelConfig>` to `[ariaLabelConfig]`. Omitted keys keep their English defaults, exported as `DEFAULT_ARIA_LABEL_CONFIG`; names and descriptions update as soon as the configuration or the entity metadata changes.

```typescript
const labels: Partial<AriaLabelConfig> = {
  flowLabel: 'Граф согласования',
  selected: 'Выбран.',
  parentDescription: (parent) => `Родитель: ${parent}.`,
  edgeLabel: ({ source, target }) => `Связь от ${source} к ${target}`,
};
```

```html
<vflow [nodes]="nodes" [edges]="edges" [ariaLabelConfig]="labels" />
```

| Key                                           | Default                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `flowLabel`, `flowDescription`                | `Graph`, empty                                                                               |
| `minimapLabel`                                | `Graph minimap`                                                                              |
| `nodeLabel`                                   | `(id) => 'Node {id}'`                                                                        |
| `edgeLabel`                                   | `({ source, target }) => 'Connection from {source} to {target}'`                             |
| `nodeRole`, `groupRole`, `edgeRole`           | `node`, `group`, `edge`: the `aria-roledescription` a screen reader says instead of the role |
| `parentDescription`                           | `(parent) => 'Parent: {parent}.'`                                                            |
| `selected`                                    | `Selected.`                                                                                  |
| `selectionUnavailable`, `movementUnavailable` | `Selection unavailable.`, `Movement unavailable.`                                            |
| `nodeInstructions`, `edgeInstructions`        | `(keys, state) => string`, the instruction sentences above                                   |
| `selectionAnnouncement`                       | `({ label, selected, count }) => '{label} selected. {count} selected in total.'`             |
| `selectionClearedAnnouncement`                | `Selection cleared.`                                                                         |
| `movedAnnouncement`                           | `({ count, direction, x, y }) => 'Moved node {direction}. Position: {x}, {y}.'`              |
| `zoomAnnouncement`                            | `(zoom) => 'Zoom {percent}%.'`                                                               |

Formatters receive and return plain text. `nodeInstructions` and `edgeInstructions` are either a sentence or a function of the keys bound at that moment and of what the entity can do, so an instruction follows a remap on its own and never names a command that is disabled or unavailable:

```typescript
const labels: Partial<AriaLabelConfig> = {
  nodeInstructions: ({ select, move, delete: remove }, { selectable, movable }) => [selectable && select ? `Нажмите ${select} для выбора.` : '', movable && move ? `Перемещайте выбранный узел: ${move}.` : '', remove ? `Нажмите ${remove} для удаления.` : ''].filter(Boolean).join(' '),
};
```

`keys` carries `select`, `clearSelection`, `delete`, `move`, `pan`, `zoomIn`, `zoomOut`, `fitView` and `multiSelection`, each already formatted as a phrase such as `Enter or Space`, with modifiers spelled as words; a disabled command is an empty string. `state.selectable` is false for an unselectable entity and in `selectionMode="manual"`; `state.movable` is true for a draggable node that is selectable or already selected. Key names are English; a translation that wants its own words for them passes a plain string, which then stays fixed whatever the keys are.

## Limits

Handles are not exposed and cannot be operated from the keyboard, so creating and reconnecting edges needs a pointer. Resize controls are pointer-only and the minimap has no Tab stop. The checks that back this page, automated and with a screen reader, are recorded in `docs/accessibility-verification.md`; automated checks alone do not establish screen-reader usability.
