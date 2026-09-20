Graph entities have readable names, relationships and state descriptions. This example includes template nodes, a visual group, template edges, a minimap and a second graph.

{{ NgDocActions.demoPane("AccessibilityDemoComponent") }}

## Keyboard navigation

{{ NgDocActions.demoPane("KeyboardNavigationDemoComponent") }}

`Tab` and `Shift+Tab` visit focusable nodes in the input `nodes` order, then edges in the input `edges` order. Parent relationships and visual elevation do not reorder the sequence. Embedded controls keep their DOM order and their own keyboard behavior. Tab leaves the graph normally; there is no focus trap. Focus has a separate visible indicator and does not change selection: a ring around the node wrapper, a dashed halo along the edge path, and an inner border on the graph container when it holds focus. The ring takes its color from `--vflow-focus`, its thickness from `--vflow-focus-width`, its distance from the node from `--vflow-focus-offset` and its corners from `--vflow-focus-radius`; set the radius to the corner radius of your node template so the ring follows its shape. The ring is drawn on the library wrapper around the template, so a value set inside the template does not reach it: set the tokens on the flow element for a uniform design, or per node from a global stylesheet, either on a `data-*` attribute the node carries through `domAttributes` (`.vflow-node[data-shape="pill"] { --vflow-focus-radius: 999px }`) or through `:has()` on a class of the template (`.vflow-node:has(.card) { --vflow-focus-radius: 12px }`).

Each row below is a command of `keyboardShortcuts.commands`. [Keyboard shortcuts](../keyboard-shortcuts) lists the keys they carry by default and how to change them; the descriptions read out with an entity name the keys that are bound at the time.

| Command                         | Behavior                                                                                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `select`                        | Select the focused entity and clear the rest of the selection. While the multiselection modifier is held, toggle only the focused entity.                                                       |
| `clearSelection`                | Clear the selection and keep focus where it is.                                                                                                                                                 |
| `delete`                        | Emit `deleteRequest`: the whole selection when the focused entity is selected, otherwise only the focused entity. The application removes them, or ignores the request.                         |
| `moveUp` and its three siblings | Move every selected movable node by 5 flow-space units, or 20 while Shift is held.                                                                                                              |
| `panUp` and its three siblings  | Pan the view by 15 screen pixels in the reading direction, or 60 while Shift is held: panning right reveals what lies to the right. Runs on the graph container as well as on a focused entity. |
| `zoomIn`, `zoomOut`             | Zoom by a factor of 1.2 around the view center, within `minZoom` and `maxZoom`.                                                                                                                 |
| `fitView`                       | Fit the whole graph into the view.                                                                                                                                                              |

A deletion key on a focused node or edge emits `(deleteRequest)` with `{ nodeIds, edgeIds }`, once per press. The command acts at the point of focus: when the focused entity is selected, the request carries the whole selection; otherwise it carries only the focused entity, and a selection elsewhere stays untouched. The library does not remove anything or clear selection: apply the request with `removeNodes` and `removeEdges`, or ignore it. When the focused entity disappears, focus recovery moves focus to the next entity. The keys follow `keyboardShortcuts.commands.delete` (`Delete` and `Backspace` by default, an empty list disables the command and its instruction).

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

Viewport commands work on a focused node or edge and on the graph container itself, which receives focus after the last entity disappears. Arrow keys pan only when they do not move a node, so a selected movable node still moves. The keys follow `keyboardShortcuts.commands.zoomIn`, `zoomOut`, `fitView` and `panUp` and its three siblings; `Ctrl`, `Cmd` and `Alt` combinations are left to the browser. Panning is silent; zooming announces the resulting scale.

Keyboard commands report their outcome in the flow's own polite, atomic live region: `Child selected. 1 selected in total.`, `Selection cleared.` and `Moved node right. Position: 25, 20.` (the focused node's position after the move). Only a command that changes state is announced; pointer and programmatic changes stay silent. A key bound as a modifier through `keyboardShortcuts.modifiers`, such as `Space` for `panActivation`, is left to the gesture layer and runs no command.

With snapping enabled on an axis (`snapGrid` value greater than 1), movement on that axis uses one cell, or four cells with Shift. The steps are fixed. Existing snapping and `extent: 'parent'` bounds apply. Selected descendants of a moving selected ancestor are not moved twice. Movement updates the application's writable position signals and emits the ordinary position change notifications; it does not synthesize pointer drag lifecycle events.

Selection acquisition respects `selectable`; deselection remains allowed. In `selectionMode="manual"`, keyboard commands do not write selection. A focused node must itself be selected and movable to initiate movement of the selected set. Focus eligibility uses the existing node/edge `focusable` overrides and global `nodesFocusable` / `edgesFocusable` defaults. Denying wrapper focus does not disable embedded controls.

When a focused entity is removed or becomes non-focusable, focus moves to the next eligible entity, then the previous, then the graph container if none remain. Changes do not steal focus from elsewhere. No initial focus is taken on page load.

`autoPanOnNodeFocus` defaults to `true`, independently of drag `autoPan`. A fully offscreen node receiving keyboard-visible focus is immediately centered at the current zoom. Any positive overlap with the viewport suppresses this pan, even for oversized nodes. Edge focus and movement with arrow keys do not pan. Set `[autoPanOnNodeFocus]="false"` to disable focus panning; it supports runtime changes.

Commands from inputs, textareas, selects, contenteditable regions, buttons and other descendants do not trigger graph selection or movement. Add `vflowNoKeyboard` to an element or ancestor to opt an application area out of graph keyboard commands without changing native Tab behavior. The directive is included in `Vflow` and can also be imported as `NoKeyboardDirective`.

With virtualization enabled, CSS-hidden entities are skipped by native Tab navigation and focus repair. The currently focused node or edge (including embedded node, toolbar and edge-label controls) stays in layout when the viewport moves. To reach every offscreen entity through Tab and focus auto-pan, leave virtualization disabled.

## Names and descriptions

The flow is a named `region`. Nodes (including visual groups) and edges are named `group` elements. The minimap is one `img` named `Graph minimap`; its preview nodes do not form a second graph in the accessibility tree. Handles are semantically transparent: no role, name or description, while their own content keeps its semantics and `domAttributes` still applies `data-*` metadata to the element.

```typescript
import { AriaLabelConfig, createNodes, createEdges } from 'ngx-vflow';

const nodes = createNodes([
  { id: 'request', point: { x: 20, y: 40 }, data: { text: 'Request' }, ariaLabel: 'Expense request', ariaDescription: 'Requires approval.', domAttributes: { 'data-record': 'request', lang: 'en' } },
  { id: 'approval', point: { x: 250, y: 40 }, ariaLabel: 'Approval' },
]);
const edges = createEdges([{ id: 'review', source: 'request', target: 'approval', ariaLabel: 'Review route' }]);

nodes[0].ariaDescription!.set('Ready for approval.');
```

`ariaLabel`, `ariaDescription` and `domAttributes` are optional writable signals on `Node` and `Edge`. Both factory modes preserve supplied values. Omitted metadata remains absent, allowing generated defaults. A handle takes only `domAttributes`:

```html
<span vflowHandle handleType="target" position="left" handleId="incoming" [domAttributes]="{ 'data-port': 'review' }"></span>
```

Names prefer a nonblank `ariaLabel`, then `Node {id}` or `Group {id}`. Custom templates/components need application-supplied names; the library does not inspect their descendants. An edge defaults to `Connection from {source name} to {target name}`.

The graph remains flat. A child's description identifies its direct parent by accessible name, including ordinary parent nodes. A custom edge name retains endpoint information in its description. Application descriptions supplement these relationships and library state descriptions.

Actual selection is described as `Selected.` even when acquiring selection is unavailable. Unavailable selection, movement and reconnection are described separately. A restriction never sets whole-node `aria-disabled`, so embedded controls remain operable. Description changes are not announced; only keyboard commands report their outcome.

## Localization

Bind a `Partial<AriaLabelConfig>` to `[ariaLabelConfig]`. Every omitted key uses its English default; replacing the configuration resets omitted overrides. Entity metadata and configuration changes update names and descriptions reactively.

```typescript
const labels: Partial<AriaLabelConfig> = {
  flowLabel: 'Граф согласования',
  flowDescription: 'Заявка и её согласование.',
  minimapLabel: 'Мини-карта графа',
  selected: 'Выбран.',
  parentDescription: (parent) => `Родитель: ${parent}.`,
  edgeLabel: ({ source, target }) => `Связь от ${source} к ${target}`,
};
```

```html
<vflow [nodes]="nodes" [edges]="edges" [ariaLabelConfig]="labels" />
```

`DEFAULT_ARIA_LABEL_CONFIG` exports all defaults. Use the following keys to translate the complete library vocabulary; translate application-provided names and descriptions separately.

| Key                            | Default / formatter arguments                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `flowLabel`                    | `Graph`                                                                                             |
| `flowDescription`              | Empty string                                                                                        |
| `minimapLabel`                 | `Graph minimap`                                                                                     |
| `minimapDescription`           | Empty string                                                                                        |
| `nodeLabel`, `groupLabel`      | `(id: string) => string`                                                                            |
| `edgeLabel`                    | `({ source: string, target: string }) => string`                                                    |
| `parentDescription`            | `(parent: string) => string`, default `Parent: {parent}.`                                           |
| `selected`                     | `Selected.`                                                                                         |
| `selectionUnavailable`         | `Selection unavailable.`                                                                            |
| `movementUnavailable`          | `Movement unavailable.`                                                                             |
| `reconnectionUnavailable`      | `Reconnection unavailable.`                                                                         |
| `keyboardNavigation`           | Instructions for Tab and Shift+Tab traversal.                                                       |
| `keyboardSelect`               | Written from `keys.select` and `keys.multiSelection`.                                               |
| `keyboardDeselect`             | Written from `keys.clearSelection`.                                                                 |
| `keyboardMove`                 | Written from `keys.move`; omitted when no movement command has a key.                               |
| `keyboardDelete`               | Written from `keys.delete`; omitted when the command is disabled.                                   |
| `keyboardPan`                  | Written from `keys.pan`; omitted when no panning command has a key.                                 |
| `keyboardZoom`                 | Written from `keys.zoomIn`, `keys.zoomOut` and `keys.fitView`; omitted when all three are disabled. |
| `zoomAnnouncement`             | `(zoom: number) => string`, default `Zoom {percent}%.`                                              |
| `selectionAnnouncement`        | `({ label: string, selected: boolean, count: number }) => string`, live feedback                    |
| `selectionClearedAnnouncement` | `Selection cleared.`                                                                                |
| `movedAnnouncement`            | `({ count, direction: 'left' \| 'right' \| 'up' \| 'down', x, y }) => string`                       |

Formatters receive plain text. Return plain text without HTML markup.

Every `keyboard*` entry is either a sentence or a function of the keys that are bound right now, so an instruction follows a remap on its own:

```typescript
const labels: Partial<AriaLabelConfig> = {
  keyboardSelect: ({ select, multiSelection }) => `Press ${select} to select, or hold ${multiSelection} to toggle.`,
};
```

`keys` carries `select`, `clearSelection`, `delete`, `move`, `pan`, `zoomIn`, `zoomOut`, `fitView` and `multiSelection`, each already formatted as a phrase such as `Enter or Space`. A modifier is named in words rather than glyphs, because a screen reader spells a glyph unpredictably. Key names are English; a translation that needs its own words for them supplies the whole sentence as a plain string instead, which then stays fixed whatever the keys are.

## Custom content and safe metadata

`DomAttributes` accepts `data-*`, `title`, `lang` and `dir`. Metadata is applied to the library-owned entity wrapper; setting a value to `null` or removing it removes the attribute. Public types reject other keys, and runtime filtering ignores unsupported keys. Roles, IDs, ARIA attributes, styles, focus attributes and event handlers are owned by the library and cannot be replaced through this object. Use the dedicated name/description inputs instead.

Give domain-specific nodes meaningful names. Give custom buttons, inputs, edge-label controls and handle contents their own labels, roles and keyboard behavior. The library keeps these descendants accessible, including content inside resizable wrappers. Mark your own decorative SVG paths `aria-hidden="true"`; library geometry and the auxiliary handle magnet are already excluded.

Each flow owns independent description references and one polite, atomic live region that receives only the keyboard command feedback described above. There is no public arbitrary-announcement API.

## Current limits

Graph wrappers support the keyboard operations described above. Embedded application controls retain their native keyboard behavior. Handles are not exposed to assistive technology and the minimap has no Tab stop. This does not establish full keyboard accessibility for every graph operation.

- Keyboard connection creation is currently unsupported. The issue 11 implementation was rolled back pending a new interaction design.
- Issues 12–13 own minimap interaction and keyboard navigation.
- Issue 14 owns accessible resize/reconnect controls. Existing library resize and reconnect controls remain pointer-only; naming their owner does not make those controls accessible.

## Verification scenario

Use the example above to read both graph regions, Request's parent/selection/restrictions, both edge relationships, and the minimap. Reach and activate `Review request` as an independent button and switch language. Handles are absent from the reading sequence; a pointer connection between them still works.

The repository records automated checks and screen-reader availability in `docs/accessibility-verification.md`. Automated axe checks alone do not establish screen-reader usability or full keyboard operation.
