# Accessibility: current state, third-party survey and simplification proposals

Date: 2026-09-26. Branch `3.0`. P1–P5 were implemented the same day (uncommitted at the time of writing); the
`movable` flag ended up as "a draggable node that is selectable or already selected", so an unselectable node is not
promised movement it cannot get from the keys.

## 1. What ngx-vflow does today

Measured on `/interactions/accessibility` in Chromium (dev server, 2026-09-26).

| Element | Role / name                                       | Description                                                                                                 | Tab stop |
| ------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| Flow    | `region`, `flowLabel`                             | `flowDescription`                                                                                           | `-1`     |
| Node    | `group`, `ariaLabel` → `Node {id}` / `Group {id}` | `ariaDescription` + `Parent: X.` + `Selected.` + `… unavailable.` ×2 + **7 keyboard instruction sentences** | `0`      |
| Edge    | `group`, `ariaLabel` → `Connection from A to B`   | `ariaDescription` + endpoints + `Selected.` + `… unavailable.` ×2 + **6 instruction sentences**             | `0`      |
| Minimap | `img`, `minimapLabel`                             | `minimapDescription`                                                                                        | none     |
| Handles | none (transparent since 2026-09-20)               |                                                                                                             | none     |
| Live    | one `aria-live="polite" aria-atomic` div per flow | selection / cleared / moved / zoom                                                                          |          |

Public surface: `ariaLabelConfig` (**26 keys**, 7 of them `KeyboardInstruction` functions over a 9-field
`KeyboardInstructionKeys`), `nodesFocusable`, `edgesFocusable`, `autoPanOnNodeFocus`, `keyboardShortcuts`,
`(deleteRequest)`, per-entity `ariaLabel` / `ariaDescription` / `domAttributes` / `focusable`, `vflowNoKeyboard`.

Implementation: ~1.1k lines across `entity-accessibility.directive.ts`, `keyboard-entity.directive.ts`,
`keyboard-navigation.directive.ts`, `keyboard.service.ts`, `keyboard-labels.service.ts`,
`keyboard-entity-commands.service.ts`, `keyboard-viewport-commands.service.ts`, `keyboard-binding.ts`,
`keyboard-format.ts`, `announcer.service.ts`, `live-region.directive.ts`.

### The description a screen reader actually reads for an ordinary node

> Use Tab and Shift+Tab to move focus. Press Enter or Space to select. Hold Command to toggle selection. Press Escape
> to clear selection. When selected, use arrow keys to move movable selected nodes. Hold Shift to move faster. Press
> Delete or Backspace to request deletion of this item, or of the whole selection when it is selected. Use arrow keys
> to pan the view when they do not move a node. Hold Shift to pan faster. Press +, = or NumpadAdd to zoom in, - or
> NumpadSubtract to zoom out and 0 or Numpad0 to fit the graph.

That is 88 words per node, and the same text again on every edge. React Flow reads 23 words per node
(`Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.`),
Foblex reads its instructions once, on the container.

### Small defects found

- Edge with a custom `ariaLabel`: `Keep a copy. Connection from Request to Archive Selected.` — the endpoint phrase
  gets no period before the next sentence (`edge.model.ts` joins `endpoints` without punctuation).
- `Reconnection unavailable.` is announced on edges although reconnection is never available by keyboard, so the
  sentence only tells a keyboard user about a pointer feature they cannot use anyway.
- `Use Tab and Shift+Tab to move focus.` is read on every entity; a screen-reader user knows what Tab does.
- The Russian example in the demo overrides `keyboardSelect` with a fixed sentence that stops following remaps — an
  expected consequence of the current design, but it shows that translations will normally freeze the keys.

## 2. Survey of other node editors (September 2026)

Full agent report with URLs is condensed here.

| Library                             | Container                                                                                                        | Node / edge wrappers                                                                                                                                                                                        | Focus model                                                                               | Announces                                        | Config surface                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| React Flow 12 / Svelte Flow 1.1     | `role=application`, no name, no tabindex                                                                         | `role=group` (`ariaRole` override), `aria-roledescription="node"/"edge"`, `aria-label`, `aria-describedby` → one hidden instruction div per flow, `tabindex=0`, `domAttributes`; non-focusable edge = `img` | every node and edge is a Tab stop, DOM order; Enter/Space/Escape; arrows move             | node moves only (`assertive`)                    | 5 flow props + 3 entity fields + `ariaLabelConfig` with 11 flat keys (4 a11y texts, 7 button labels) |
| Vue Flow 1.x                        | none                                                                                                             | as React Flow v11, hard-coded English                                                                                                                                                                       | same                                                                                      | moves only                                       | 3 props, no localization                                                                             |
| Foblex Flow 19 (Angular)            | `role=application`, `tabindex=0`, `aria-describedby` instructions, `aria-activedescendant` (opt-in `withA11y()`) | `role=group` + roledescription `node`/`group`/`connection`, generated connection label                                                                                                                      | single Tab stop; arrows drive _selection_, spatial + along edges; Space grab; `C` connect | selection, move, connect, delete, zoom, `i of n` | `withA11y({ keyboard, moveStep, coarseMoveStep, keys (7), messages (24) })`                          |
| ng-diagram (Angular)                | none                                                                                                             | none; app supplies roles (their sample: `tree`/`treeitem`)                                                                                                                                                  | shortcut manager only                                                                     | no                                               | `configureShortcuts([...])`                                                                          |
| tldraw                              | `role=application`, named, `tabindex=-1`                                                                         | `data-*` only                                                                                                                                                                                               | focus stays on container; Tab moves selection in reading order                            | `role=status`: `desc, type. i of n`              | `ShapeUtil.getAriaDescriptor/getText/canTabTo`, i18n table                                           |
| GoJS (canvas)                       | canvas + `aria-labelledby` → app `<output>`                                                                      | n/a                                                                                                                                                                                                         | opt-in focus navigation + virtual pointer                                                 | only what the app writes in `focusChanged`       | 5 CommandHandler members, zero strings                                                               |
| JointJS, Rete, Drawflow, Excalidraw | nothing built in                                                                                                 |                                                                                                                                                                                                             |                                                                                           |                                                  |                                                                                                      |

WAI-ARIA: the Graphics module (`graphics-document` / `graphics-object` / `graphics-symbol`) exists but nobody in this
category ships it; `graphics-symbol` hides the subtree, which kills custom node content. APG has no diagram pattern;
its two composite-widget techniques are roving tabindex and `aria-activedescendant`, and both are in use here (xyflow
family vs Foblex/tldraw).

What is common practice:

1. `role="group"` + `aria-roledescription="node" | "edge"` on wrappers (xyflow, Svelte, Vue, Foblex). ngx-vflow lacks
   the roledescription, so VoiceOver says `Request, group` where every other library says `Request, node`.
2. One short instruction text per flow, referenced by `aria-describedby`, not a per-entity catalogue of every command.
3. Live region announces at most moves (xyflow) or selection + moves (Foblex, tldraw); nobody announces pan.
4. Enter/Space select, Escape clear, arrows move (Shift = coarse), Delete/Backspace delete. ngx-vflow matches.
5. Handles are not exposed anywhere except Foblex's keyboard-connect mode. ngx-vflow matches.
6. String config is either flat and small (xyflow: 11) or large because every state transition is announced
   (Foblex: 24). ngx-vflow has 26 keys while announcing four events, so most of its keys pay for instruction sentences.

Where ngx-vflow is ahead: named `region` container (React Flow's `application` has no name, which ARIA requires),
`polite` region (better under key autorepeat), focus recovery after deletion, instructions that follow a remap,
reactive localization, per-interaction restriction sentences instead of `aria-disabled`, focus ring scaled by zoom.

Where others are ahead (feature gaps, not simplifications): spatial arrow navigation between entities (Foblex,
tldraw, GoJS), `i of n` position on focus (Foblex, tldraw), select all (Foblex, ng-diagram, GoJS), keyboard
connections (Foblex only; React Flow's is an unmerged PR xyflow/xyflow#6012).

## 3. Proposals

Ordered by value ÷ cost. P1–P4 are simplifications; P5–P6 are small additions that other libraries treat as
baseline; P7 lists what stays out.

### P1. One short instruction per entity kind instead of seven sentences

Replace `keyboardNavigation`, `keyboardSelect`, `keyboardDeselect`, `keyboardMove`, `keyboardDelete`, `keyboardPan`,
`keyboardZoom` with two entries:

```ts
nodeInstructions: (keys: KeyboardInstructionKeys) => string;
edgeInstructions: (keys: KeyboardInstructionKeys) => string;
```

Defaults, in the spirit of React Flow but naming the bound keys:

- node: `Press ${select} to select. Arrow keys move a selected node. Press ${delete} to delete.`
- edge: `Press ${select} to select. Press ${delete} to delete.`

Drop the Tab sentence (screen-reader users know Tab), drop pan/zoom sentences from entities (viewport commands
belong to the shortcut page and, optionally, to `flowDescription`), drop `Hold Shift to … faster` (a refinement
nobody else reads out). Keep the per-entity omission logic only for the three cases that change the sentence
(`selectable`, `draggable`, `delete` disabled): simplest is to pass those flags into the function too:

```ts
nodeInstructions: (keys, state: { selectable: boolean; movable: boolean }) => string;
```

so a translation stays one function and the library stops assembling sentences. `KeyboardInstructionKeys` keeps
its fields; `pan`, `zoomIn`, `zoomOut`, `fitView` stay available to anyone who wants them in the text.

Effect: 26 → 21 config keys, `keyboard-entity.directive.ts` loses its 7-branch description builder, description per
node drops from ~88 to ~20 words. Breaking for anyone who overrode the seven keys (only the docs demo does).

### P2. Add `aria-roledescription` and drop `groupLabel`

Set `aria-roledescription` on wrappers, localizable through three keys `nodeRole: 'node'`, `groupRole: 'group'`,
`edgeRole: 'edge'`. With that, a parent without `ariaLabel` can read `Node parent, group` and `groupLabel`
(`Group {id}`) is no longer needed: −1 key, +3 keys, and the reading matches every other library.
`ADR-0004` is untouched: the role itself stays library-owned.

### P3. Remove the "unavailable" sentences that describe pointer-only features

- Remove `reconnectionUnavailable` (reconnection is pointer-only, the sentence carries no keyboard information).
- Keep `selectionUnavailable` and `movementUnavailable`; with P1 they are what tells the user why the instruction
  is missing. This is the point where ADR-0004 ("unavailable interactions are described individually") is kept.

Alternative, further from ADR-0004: drop all three and rely on the shorter instruction only. Not recommended: a
listener cannot notice an absent sentence.

### P4. Drop `minimapDescription`

Empty by default, nothing sets it, React Flow and Foblex do not have it. `flowDescription` stays: it is the natural
place for one flow-level sentence (and, if wanted, the pan/zoom keys).

Resulting `AriaLabelConfig` (17 keys, from 26):

```
flowLabel, flowDescription, minimapLabel,
nodeLabel, edgeLabel, parentDescription,
nodeRole, groupRole, edgeRole,
selected, selectionUnavailable, movementUnavailable,
nodeInstructions, edgeInstructions,
selectionAnnouncement, selectionClearedAnnouncement, movedAnnouncement, zoomAnnouncement
```

(18 with `zoomAnnouncement`; the four announcement keys stay as they are.)

### P5. Fix the edge description punctuation

`edge.model.ts`: when the edge has a custom name, the endpoint phrase needs a terminating period before
`Selected.`. One-line fix plus an e2e regex update.

### P6. Keep the instruction text in one hidden element per flow (optional)

Today `AriaDescriber` from the CDK already dedupes identical descriptions into shared hidden elements, so the DOM
cost is fine. Nothing to do unless P1 is rejected.

### P7. Stays out for now

- `role="application"` on the container: would switch screen readers out of browse mode; the named `region` is
  the better default while Tab is the navigation model.
- Spatial arrow navigation, `i of n`, select all, keyboard connections: real gaps, separate specs. Keyboard
  connections were rolled back on 2026-09-05 (issue 11) and Foblex's `C`-then-arrows design is the only shipping
  precedent, worth a look when that is reopened.
- `aria-keyshortcuts`, resolved shortcut signal (issue 05 of `keyboard-shortcuts-2026-09-20`): unchanged.

## 4. Documentation

`interactions/accessibility/index.md` was rewritten against the current API on 2026-09-26: 1,770 → ~900 words,
the same two demos, one table for what is rendered, one for the localization keys. Removed: the verification
scenario, issue numbers, the `:has()` selector lesson, the duplicated command table (the shortcut page owns the
keys), the repeated deletion prose, and the section on `keys` internals. If P1–P4 land, only the localization table
and the instruction paragraph change.

Suggested follow-up after the decision: update `docs/accessibility-verification.md` with the new description text
and re-run `accessibility.spec.ts` (unit + e2e), then a real VoiceOver pass on the demo, which has not happened since
2026-09-05.

## 5. Demos (2026-09-26, later the same day)

React Flow and tldraw ship no demo on their accessibility pages; Foblex links one. The two ngx-vflow examples were
Playwright fixtures (checkboxes for grid, manual selection and auto-pan; counters for reviews and connections) and
were replaced by one example whose point is visible: a text mirror of the focused entity's name, role description and
description, and of the last live-region message. e2e scenarios that only existed for the checkboxes were dropped in
favor of the unit suite.
