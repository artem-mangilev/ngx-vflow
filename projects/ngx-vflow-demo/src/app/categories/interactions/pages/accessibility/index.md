Graph entities have readable names, relationships and state descriptions. This example includes default and custom nodes, a visual group, default and custom edges, a minimap and a second graph.

{{ NgDocActions.demoPane("AccessibilityDemoComponent") }}

## Keyboard navigation

{{ NgDocActions.demoPane("KeyboardNavigationDemoComponent") }}

`Tab` and `Shift+Tab` visit focusable nodes in the input `nodes` order, then edges in the input `edges` order. Parent relationships and visual elevation do not reorder the sequence. Embedded controls keep their DOM order and their own keyboard behavior. Tab leaves the graph normally; there is no focus trap. Focus has a separate visible indicator and does not change selection.

| Command on an entity wrapper                | Behavior                                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Enter` / `Space`                           | Select the entity and clear other selection.                                                                                           |
| Multiselection modifier + `Enter` / `Space` | Toggle only the focused entity. The modifier follows `keyboardShortcuts.multiSelection` (Meta on macOS, Control elsewhere by default). |
| `Escape`                                    | Clear selection and retain focus.                                                                                                      |
| Arrow keys on a selected movable node       | Move all selected movable nodes by 5 flow-space units.                                                                                 |
| `Shift` + arrow keys                        | Move by 20 flow-space units.                                                                                                           |

With snapping enabled on an axis (`snapGrid` value greater than 1), movement on that axis uses one cell, or four cells with Shift. The steps are fixed. Existing snapping and `extent: 'parent'` bounds apply. Selected descendants of a moving selected ancestor are not moved twice. Movement updates the application's writable position signals and emits the ordinary position change notifications; it does not synthesize pointer drag lifecycle events.

Selection acquisition respects `selectable`; deselection remains allowed. In `selectionMode="manual"`, keyboard commands do not write selection. A focused node must itself be selected and movable to initiate movement of the selected set. Focus eligibility uses the existing node/edge `focusable` overrides and global `nodesFocusable` / `edgesFocusable` defaults. Denying wrapper focus does not disable embedded controls.

When a focused entity is removed or becomes non-focusable, focus moves to the next eligible entity, then the previous, then the graph container if none remain. Changes do not steal focus from elsewhere. No initial focus is taken on page load.

`autoPanOnNodeFocus` defaults to `true`, independently of drag `autoPan`. A fully offscreen node receiving keyboard-visible focus is immediately centered at the current zoom. Any positive overlap with the viewport suppresses this pan, even for oversized nodes. Edge focus and movement with arrow keys do not pan. Set `[autoPanOnNodeFocus]="false"` to disable focus panning; it supports runtime changes.

Commands from inputs, textareas, selects, contenteditable regions, buttons and other descendants do not trigger graph selection or movement. Add `vflowNoKeyboard` to an element or ancestor to opt an application area out of graph keyboard commands without changing native Tab behavior. The directive is included in `Vflow` and can also be imported as `NoKeyboardDirective`.

This keyboard contract requires virtualization to be disabled. Compatibility with the current virtualization implementation is deferred.

## Names and descriptions

The flow is a named `region`. Nodes (including visual groups), edges and handles are named `group` elements. The minimap is one `img` named `Graph minimap`; its preview nodes do not form a second graph in the accessibility tree.

```typescript
import { AriaLabelConfig, createNodes, createEdges } from 'ngx-vflow';

const nodes = createNodes([
  { id: 'request', type: 'default', point: { x: 20, y: 40 }, text: 'Request', ariaLabel: 'Expense request', ariaDescription: 'Requires approval.', domAttributes: { 'data-record': 'request', lang: 'en' } },
  { id: 'approval', type: 'html-template', point: { x: 250, y: 40 }, ariaLabel: 'Approval' },
]);
const edges = createEdges([{ id: 'review', source: 'request', target: 'approval', ariaLabel: 'Review route' }]);

nodes[0].ariaDescription!.set('Ready for approval.');
```

`ariaLabel`, `ariaDescription` and `domAttributes` are optional writable signals on `Node` and `Edge`. Both factory modes preserve supplied values. Omitted metadata remains absent, allowing generated defaults. Handles expose ordinary Angular inputs:

```html
<handle type="target" position="left" id="incoming" ariaLabel="Approve expense" ariaDescription="Inbound review route." [canStart]="false" [canAccept]="true" [domAttributes]="{ 'data-port': 'review' }" />
```

Names prefer a nonblank `ariaLabel`, then a default node's text with HTML removed, then `Node {id}` or `Group {id}`. Custom templates/components need application-supplied names; the library does not inspect their descendants. An edge defaults to `Connection from {source name} to {target name}`. A handle defaults to `Source connection point [id] of {node name}` or its `Target` equivalent, omitting a missing ID.

The graph remains flat. A child's description identifies its direct parent by accessible name, including ordinary parent nodes. A custom edge name retains endpoint information in its description. Application descriptions supplement these relationships and library state descriptions.

Actual selection is described as `Selected.` even when acquiring selection is unavailable. Unavailable selection, movement, reconnection, connection start and connection acceptance are described separately. A restriction never sets whole-node `aria-disabled`, so embedded controls remain operable. `Valid connection target.` and `Invalid connection target.` apply only to the current checked connection candidate, and disappear when that check ends. These changes do not trigger automatic action announcements.

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

| Key                           | Default / formatter arguments                                           |
| ----------------------------- | ----------------------------------------------------------------------- |
| `flowLabel`                   | `Graph`                                                                 |
| `flowDescription`             | Empty string                                                            |
| `minimapLabel`                | `Graph minimap`                                                         |
| `minimapDescription`          | Empty string                                                            |
| `nodeLabel`, `groupLabel`     | `(id: string) => string`                                                |
| `edgeLabel`                   | `({ source: string, target: string }) => string`                        |
| `handleLabel`                 | `({ type: 'source' \| 'target', id?: string, node: string }) => string` |
| `parentDescription`           | `(parent: string) => string`, default `Parent: {parent}.`               |
| `selected`                    | `Selected.`                                                             |
| `selectionUnavailable`        | `Selection unavailable.`                                                |
| `movementUnavailable`         | `Movement unavailable.`                                                 |
| `reconnectionUnavailable`     | `Reconnection unavailable.`                                             |
| `connectionStartUnavailable`  | `Starting connections unavailable.`                                     |
| `connectionAcceptUnavailable` | `Accepting connections unavailable.`                                    |
| `connectionValid`             | `Valid connection target.`                                              |
| `connectionInvalid`           | `Invalid connection target.`                                            |
| `keyboardNavigation`          | Instructions for Tab and Shift+Tab traversal.                           |
| `keyboardSelect`              | Instructions for selection and the multiselection modifier.             |
| `keyboardDeselect`            | Instructions for clearing selection with Escape.                        |
| `keyboardMove`                | Instructions for arrows and accelerated movement with Shift.            |

Formatters receive plain text. Return plain text without HTML markup.

## Custom content and safe metadata

`DomAttributes` accepts `data-*`, `title`, `lang` and `dir`. Metadata is applied to the library-owned entity wrapper; setting a value to `null` or removing it removes the attribute. Public types reject other keys, and runtime filtering ignores unsupported keys. Roles, IDs, ARIA attributes, styles, focus attributes and event handlers are owned by the library and cannot be replaced through this object. Use the dedicated name/description inputs instead.

Give domain-specific nodes and handles meaningful names. Give custom buttons, inputs, edge-label controls and handle contents their own labels, roles and keyboard behavior. The library keeps these descendants accessible, including content inside resizable wrappers. Mark your own decorative SVG paths `aria-hidden="true"`; library geometry and the auxiliary handle magnet are already excluded.

Each flow owns independent description references and one initially empty, polite, atomic live region. There is no public arbitrary-announcement API.

## Current limits

Graph wrappers support the keyboard operations described above. Embedded application controls retain their native keyboard behavior. Handles and the minimap do not gain Tab stops. This does not establish full keyboard accessibility for every graph operation.

- Issue 11 owns keyboard connections and action announcements, including coalescing frequent updates.
- Issues 12–13 own minimap interaction and keyboard navigation.
- Issue 14 owns accessible resize/reconnect controls. Existing library resize and reconnect controls remain pointer-only; naming their owner does not make those controls accessible.

## Verification scenario

Use the example above to read both graph regions, Request's parent/selection/restrictions, both edge relationships, and the minimap. Reach and activate `Review request` as an independent button. Toggle incoming connections and switch language. With a pointer, drag from Request's source handle to Accept request to inspect valid/invalid descriptions; uncheck validation to exercise the invalid case.

The repository records automated checks and screen-reader availability in `docs/accessibility-verification.md`. Automated axe checks alone do not establish screen-reader usability or full keyboard operation.
