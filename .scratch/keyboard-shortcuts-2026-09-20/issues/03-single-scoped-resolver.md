# Resolve every key press through one scoped dispatcher

Status: resolved
Tier: 3.0-breaking
Depends on: 01, 02

## Problem

Dispatch is split between `KeyboardEntityDirective` (select, clear, delete, move) and `KeyboardNavigationDirective` (pan, zoom, fit). They coordinate through `stopPropagation`, `hasShortcut` and the rule "arrows pan when the wrapper did not move a node", all implicit in code. Adding a command means touching both and re-deriving the precedence by hand.

## Required behavior

- A `KeyboardCommandRegistry` (internal) lists every command with `scope: 'entity' | 'container' | 'both'`, `repeat: boolean`, and a `run(context)` returning whether it handled the press.
- One keydown listener on the container. It computes the origin (`entity` when the event target is a wrapper element, `container` when it is the container, otherwise none), skips editable targets and `[data-vflow-no-keyboard]`, matches the pressed key against the resolved bindings of the commands eligible for that origin in a fixed order, and runs the first whose `run` handles it. `preventDefault` and `stopPropagation` happen only for a handled press.
- Order: `select`, `clearSelection`, `delete`, `move*`, `pan*`, `zoomIn`, `zoomOut`, `fitView`. `move*` handles only a selected movable node and returns false otherwise, so the same arrow falls through to `pan*`; this replaces the implicit rule.
- Modifier keys in the `modifiers` section are reserved: a press of a reserved key never reaches commands, which replaces `hasShortcut` in the Space case.
- Held-modifier state stays in `KeyboardService` (document-level, needed by pointer gestures) but reads the same parsed bindings.
- Announcements stay inside the commands (`select`, `clearSelection`, `move*`, `zoomIn`, `zoomOut`, `fitView`).
- Auto-repeat: `move*`, `pan*`, `zoomIn`, `zoomOut` accept repeat; `select`, `clearSelection`, `delete`, `fitView` ignore it.

## Acceptance

- All existing keyboard behavior tests pass unchanged in expectations (selection, deletion rule, movement, pan fallback, zoom limits, Space passthrough, embedded controls, opt-out, focus recovery).
- A test remaps `panRight` to `moveRight`'s key and verifies that a selected movable node moves while an edge pans, proving order and fall-through.
- A test binds a command to a reserved modifier key and verifies the dev-mode warning and that the modifier wins.
- Both directives lose their keydown handlers; `KeyboardEntityDirective` keeps focus, tabindex and description; `KeyboardNavigationDirective` keeps focus recovery and hosts the single listener.

## Comments

- 2026-09-20: Implemented. `KeyboardEntityDirective` lost its keydown handler and keeps tabindex, focus auto-pan and
  the description; `KeyboardNavigationDirective` hosts the only listener and carries the command registry as an
  ordered array of `{ name, scope, repeat, run }`. `run` returns whether the command took the press, so `move*`
  declining on an edge or an unselected node is what hands the key to `pan*`. The implicit rule and the
  `stopPropagation` handshake between the two directives are gone.
- A press is skipped before any command when its key is bound as a modifier, which replaces the old `hasShortcut`
  check that only guarded selection. Editable targets and `[data-vflow-no-keyboard]` are filtered once, in the
  dispatcher, rather than in each handler.
- The blanket `ctrlKey || metaKey || altKey` guard stayed removed: exact modifier matching from issue 02 covers it.
- Auto-repeat holds the key for its command while only `move*`, `pan*`, `zoomIn` and `zoomOut` run again, matching
  what the two handlers did before.
- Verified: 279 library tests, with every prior expectation unchanged; two were added, one proving the order and the
  fall-through on a key shared by `moveRight` and `panRight`, the other proving that a key bound as a modifier never
  reaches a command and that the overlap is reported. Full docs e2e 35 passed, lint clean.
