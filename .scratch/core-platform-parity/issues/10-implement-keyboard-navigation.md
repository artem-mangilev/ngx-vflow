# Implement keyboard focus and graph navigation

Status: resolved
Tier: critical-parity
Depends on: 01, 08, 09

## Problem

Keyboard settings currently cover only selection modifiers. Users cannot traverse graph entities, select them, move nodes, or bring fully offscreen nodes into view on keyboard focus without a pointer.

## Required behavior

- Use sequential `Tab` / `Shift+Tab` traversal through focusable node and edge wrappers and embedded controls, with ordinary exit after the last element.
- Traverse nodes in input `nodes` order, then edges in input `edges` order. Parenthood and visual elevation do not change this order. Embedded controls retain ordinary DOM order.
- Keep focus independent from selection: traversing entities preserves the existing selection; selection requires a separate command.
- `Enter` or `Space` selects the focused entity and clears other selection. With the configured multiselection modifier, toggle only the focused entity. `Escape` clears selection without moving focus. In `selectionMode="manual"`, the library does not write selection.
- Arrow-key movement starts only from a selected movable node wrapper in focus and moves all selected movable nodes. A selected descendant does not receive a second displacement when a selected movable ancestor moves.
- Match React Flow's fixed movement steps: 5 flow-space units without snapping, or 20 with `Shift`; with snapping, one cell on the relevant axis, or four with `Shift`. Reuse the existing `snapGrid` and snapping rules, and preserve the existing `extent: 'parent'` constraint. Do not introduce `keyboardMovement` or another public step/multiplier setting.
- Match React Flow's node focus auto-pan behavior: when the focused node wrapper matches `:focus-visible` and the node is fully outside the viewport, immediately center the node without changing zoom. Any positive overlap counts as visible; do not add padding or special handling for oversized nodes.
- Expose an independent `autoPanOnNodeFocus` boolean input, defaulting to `true`. Do not pan on edge focus or continuously follow arrow-key node movement. Use the node's absolute bounds in flow space, including for nested nodes.
- Respect per-entity focus and selection policies together with the existing node movement capability.
- Handle graph selection and movement commands only when the entity wrapper itself is focused, not from embedded controls. Add `vflowNoKeyboard` to opt a custom area out of graph commands while preserving ordinary `Tab` behavior.
- When the focused entity is removed or becomes non-focusable, transfer focus to the next eligible entity, then the previous entity, then the graph container as fallback. Do not steal focus from elsewhere.

## Acceptance

- With virtualization disabled, a keyboard-only user can enter the flow, traverse focusable nodes and edges, select entities, move nodes, and leave the flow.
- Focus order is deterministic for nested groups and updates safely when entities are added or removed by the application.
- Movement uses existing writable signals and emits the same public change events as pointer movement.
- Verify fixed 5/20 movement, one/four-cell grid movement, parent extents, and selected parent/descendant movement without double displacement. A focused non-movable node does not initiate movement of other selected nodes.
- Focus auto-pan centers fully offscreen nodes immediately at unchanged zoom, leaves partially visible nodes in place, and can be disabled independently from drag auto-pan. Cover nested nodes, oversized nodes, edge focus, and arrow-key movement without follow-pan. This issue does not introduce viewport translation bounds or new node movement extents.
- Unit and browser tests cover nested groups, stable input order despite visual elevation, non-focusable and non-selectable entities, multi-selection, manual selection mode, embedded controls, explicit keyboard opt-out, and entity removal or focus-policy changes during focus.
- Focus is visibly distinguishable from selection. Document the implemented keyboard commands, capability rules, focus auto-pan option, and virtualization limitation; generated keyboard instructions use the existing localization API.

## Out of scope

- Keyboard connection creation and deletion.
- Automatic action announcements and announcement coalescing (issue 11).
- Command palette UI.
- Spatial-navigation algorithms beyond the documented initial policy.
- Hidden-state traversal semantics.
- New viewport translation bounds and node movement extents.
- Auto-pan on edge focus, continuous following during keyboard movement, focus-pan padding, and focus-pan animation.
- Compatibility with the current virtualization implementation, including traversal to unrendered entities. The user plans to remove that implementation; this issue does not remove or redesign it.
- A public keyboard movement-step or acceleration configuration API.

## Comments

### Grilling — 2026-09-05

- Q1 accepted: implement focus, selection, movement, and focus auto-pan without zoom changes. New viewport translation bounds and node movement extents remain separate work; issue 08 did not implement them.
- Q2 accepted: use sequential `Tab` / `Shift+Tab` traversal for entity wrappers and embedded controls, with ordinary exit from the graph. Arrow keys are reserved for moving selected nodes. Exact entity order and virtualization behavior remain to be specified.
- Q3 accepted: focus identifies the keyboard command recipient; selection identifies the set of entities affected by an action. Moving focus does not change selection. Exact selection commands remain to be specified.
- Q4 accepted: nodes in input order, then edges in input order; parent relationships and visual elevation do not reorder traversal. Embedded controls retain ordinary DOM order.
- Q5 deferred by the user: skip compatibility with the current virtualization implementation, which the user plans to remove. Full-graph traversal through virtualized entities is not an acceptance requirement for this issue.
- Q6 accepted: `Enter`/`Space` replaces selection, the configured multiselection modifier toggles only the focused entity, and `Escape` clears selection without moving focus. Manual selection mode remains application-owned.
- Q7 accepted: arrows initiate movement only from a selected node in focus, moving all selected movable nodes without double-moving selected descendants of moving selected ancestors.
- Q8 accepted: configurable default steps of 1/10 flow-space units without a grid; one/ten grid cells with a grid; `Shift` accelerates. Preserve existing parent extents.
- Q9 remains open: the user requested checking React Flow's actual focus auto-pan behavior before choosing the policy.
- Q9 research: React Flow centers a fully offscreen node on focus-visible focus, preserving zoom, with no animation or padding; any positive overlap suppresses this pan. The independent `autoPanOnNodeFocus` flag defaults to true. Edge focus and arrow-key node movement have no corresponding viewport request. See [pinned-source findings](../react-flow-focus-auto-pan.md). This comparison is evidence, not an accepted policy for ngx-vflow.
- Q10 accepted: focused-entity removal or focus-policy denial falls back to next eligible entity, then previous, then graph container; focus elsewhere is not stolen.
- Q11 accepted: graph selection/movement commands originate only on entity wrappers; preserve embedded controls' own commands and add `vflowNoKeyboard` for explicit opt-out without disabling `Tab`.
- Q9 accepted after research: copy React Flow's focus auto-pan policy. An enabled-by-default, independent `autoPanOnNodeFocus` flag controls immediate centering of fully offscreen nodes on focus-visible focus at unchanged zoom; partial visibility suppresses panning. No edge focus auto-pan, movement follow-pan, padding, or animation. This supersedes the broader initial focus-pan wording. Use correct absolute node coordinates for ngx-vflow parent relationships rather than reproducing the source-level coordinate caveat in the research note.
- Q12 remains open: the user requested checking React Flow's movement-step defaults and configuration API before choosing the ngx-vflow API.
- Q13 accepted: a selected non-movable node in focus does not initiate movement of other selected nodes. The focused node must itself be selected and movable.
- Q12 research: React Flow hard-codes a base step of 5 flow-space units without snapping and uses the corresponding `snapGrid` cell dimension with snapping; `Shift` multiplies the step by 4 (20 units or 4 cells). These constants are not a dedicated public movement configuration API. See [movement implementation](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/hooks/useMoveSelectedNodes.ts#L15-L42) and [Shift multiplier](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx#L144-L147). Adopting this would supersede Q8's configurable 1/10-unit and 1/10-cell steps; no such change has yet been accepted.
- Q12 accepted after research: copy React Flow's fixed 5/20-unit and one/four-cell movement steps, without a new `keyboardMovement` input or another step/multiplier API. This supersedes Q8's step values and configurability; existing parent extents still apply.
- All design questions Q1–Q13 are settled, with virtualization explicitly deferred. The consolidated requirements above are ready for final shared-understanding confirmation; implementation has not started in this grilling session.
- The user confirmed the consolidated contract and invoked `implement`: implementation, public-boundary TDD, code review, and a commit on the current branch are authorized.

## Answer

Implemented on 2026-09-05. Native wrapper traversal preserves application input order independently of selection and visual elevation. Keyboard selection uses the existing selection policy; movement reuses drag targeting, snapping and parent bounds. Focus recovery, localized instructions, visible focus indicators, `vflowNoKeyboard`, and independent React Flow-style `autoPanOnNodeFocus` are included, with a documentation example.

Verification: 175 library tests, 1 demo test, and all 7 Playwright tests passed, including axe. The 3 keyboard browser scenarios passed again after review fixes. Library/testing and documentation builds, library typechecking and lint passed. See [verification details](../../../docs/accessibility-verification.md).

Code review against implementation-start commit `41f70fd95d88253c7d019437ff7c56ecb7dc4122`: Standards had no actionable findings. Spec found lost relative group elevation in detached mode; this was corrected with a red/green regression test and re-reviewed with no unresolved findings. Current virtualization compatibility remains explicitly deferred as agreed.
