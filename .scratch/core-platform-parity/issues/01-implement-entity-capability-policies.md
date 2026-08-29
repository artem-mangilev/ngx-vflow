# Implement per-entity capability policies

Status: resolved
Tier: critical-parity
Depends on: —

## Problem

The public entity model has isolated flags such as node `draggable`, edge `reconnectable`, and global `entitiesSelectable`, but no consistent selection, focus, or handle-connection policy. Consumers cannot declaratively make one node non-selectable or one handle unavailable as a connection start without filtering interaction events themselves.

This issue defines capability eligibility for library-originated interactions. Capabilities do not authorize or mutate application-owned state: the application may still write entity signals or remove entities from its own collections directly.

## Public contract

- Add optional `WritableSignal<boolean>` fields named `selectable` and `focusable` to the public node and edge models.
- Add global boolean inputs named `nodesSelectable`, `edgesSelectable`, `nodesFocusable`, and `edgesFocusable`. Each defaults to `true`.
- Resolve selection and focus independently using this precedence: explicit entity override, then the corresponding global setting, then the library default `true`. Both explicit `true` and explicit `false` override the global setting; an omitted field inherits.
- Use the `selection` action in `KeyboardShortcuts` to control the selection-box gesture; set it to `null` to disable the gesture.
- Remove `entitiesSelectable` in the major release. Document migration to `nodesSelectable`, `edgesSelectable`, and `keyboardShortcuts.selection` rather than keeping an overlapping compatibility input.
- Add boolean `canStart` and `canAccept` inputs to the public `<handle>` component, both defaulting to `true`.
- Expose resolved `canStart` and `canAccept` state to custom handle templates. Do not add resolved capability fields to custom node or edge template contexts in this issue.
- Preserve the existing public meaning of `draggable`, `reconnectable`, and `selected`; they remain independent fields and are not folded into the new capability resolver.

Factories must preserve inheritance. `createNode()` and `createEdge()` must not materialize inherited selection or focus defaults as entity overrides. Their materialized return types must therefore keep the new capability fields optional instead of relying on `Required<Node>` or `Required<Edge>` for those fields.

## Selection behavior

- `selectable` controls whether a library-originated operation may acquire selection. It does not clear an existing `selected` signal when it changes to `false`.
- Deselection is always allowed. Pane clicks and replace-selection may clear an entity that is currently selected but no longer selectable.
- Default node, default group, and default edge pointer selection must use resolved eligibility.
- The `[selectable]` directive remains the DOM trigger for custom node and edge pointer selection. It does not grant eligibility and must do nothing when its parent entity resolves to non-selectable.
- Selection-box hit testing must exclude nodes and edges that resolve to non-selectable, and final selection applies that eligible preselection. The gesture itself is controlled only by the `selection` keyboard shortcut; no special policy-change recheck is required at release.
- In `selectionMode="manual"`, the library must not start selection-box selection or write any entity's `selected` signal. The consumer exclusively owns selection changes in this mode.

## Connection behavior

- `canStart` is checked before a new connection starts from a handle. Rejection must not enter connection state or emit a connection-start event.
- `canAccept` is checked on the candidate endpoint before connection-mode checks and the application validator. Rejection must not call the application validator or emit a connection request.
- Reconnection start remains controlled by `edge.reconnectable`, including its existing `source` and `target` variants.
- Reconnection does not check `canStart` on the retained or detached old endpoint. Its new candidate endpoint must pass `canAccept` before validation runs.
- The two built-in handles on a default node remain fully connectable and are not independently configurable. Consumers that need per-handle policy use a custom node with public `<handle>` components.
- No special snapshot, cancellation, or re-evaluation contract is introduced for capability changes during an already active pointer gesture. Each interaction path checks the applicable capability at its normal decision point.

## Implementation boundary

- Resolve precedence with read-only signals in the node and edge models. Interaction paths consume that resolved state rather than reproduce fallback logic.
- Apply selection and handle policies to all pointer and selection-box paths that exist in this issue.
- Define and resolve `focusable` for issues 09 and 10, but leave DOM focus, accessibility semantics, and keyboard traversal to those issues.
- Keep structural graph changes application-owned. Policy checks constrain library-originated interactions only.

## Acceptance

- Nodes and edges independently opt in or out of selection and focus through local overrides of their kind-specific global defaults.
- Omitted local fields continue to react to global selection and focus changes; factory-created entities do not accidentally shadow those changes.
- Pointer selection for default and custom entities, selection-box preselection/final selection, and deselection all follow the documented eligibility rules.
- Manual selection mode performs no library-owned selection writes, including through the selection box.
- Changing `selectable` to `false` does not rewrite `selected`, and ordinary deselection can still clear it.
- A handle with `canStart=false` cannot begin a new connection. A handle with `canAccept=false` rejects both connection and reconnection candidates before the application validator is called.
- Edge reconnection continues to honor `reconnectable` and does not confuse the retained endpoint with a new connection start handle.
- Custom handle templates can read resolved `canStart` and `canAccept`; node and edge template contexts remain unchanged.
- Focused tests cover library defaults, global defaults, explicit local `true` and `false`, reactive inheritance, factory behavior, default and custom pointer selection, selection box, manual mode, reconnect, validator short-circuiting, and disabled handles.
- Public documentation defines defaults, precedence, selection versus deselection, the application-owned state boundary, and migration from `entitiesSelectable`.

## Out of scope

- Entity visibility or hidden-state behavior, including rendering, queries, fit-view, minimap, descendants, and connected edges.
- The structural deletion request lifecycle, cascade calculation, and application veto behavior from issue 06.
- DOM focus behavior, keyboard traversal, and keyboard selection from issues 09 and 10.
- Keyboard connection creation and deletion from issue 11.
- ARIA labels, arbitrary DOM attributes, and disabled-state accessibility semantics.
- Per-handle configuration of the built-in default node.
- Special cancellation or re-evaluation behavior when a capability changes during an active gesture.
- Node movement extents and origin.

## Answer

Resolved on 2026-08-16.

- Node and edge capability overrides and kind-specific global selection/focus defaults are implemented with reactive inheritance.
- Default/custom pointer selection and selection-box selection consume resolved eligibility; manual mode and deselection preserve their documented behavior.
- New and reconnected handle candidates respect `canStart` and `canAccept`; application connection validation remains a separate, relational check.
- Custom-handle documentation and demo expose capability policies without conflating them with `ConnectionSettings.validator()`.
- `SelectionBoxSettings.enabled` was intentionally removed: `keyboardShortcuts.selection: null` is the single control for disabling the gesture.
- Factories keep omitted capability fields absent so global policy remains inheritable.

## Comments

- Grilling resolved the public contract before implementation: use flat local entity flags and flat global selection/focus inputs, control selection-box activation through keyboard shortcuts, omit visibility, and expose resolved policy only to handle templates.
