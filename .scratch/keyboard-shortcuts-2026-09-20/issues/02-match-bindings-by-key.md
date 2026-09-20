# Match bindings by key with Mod and code prefixes

Status: needs-triage
Tier: 3.0-breaking
Depends on: 01

## Problem

Bindings match `KeyboardEvent.code` only. The defaults `Equal` and `Minus` name US-layout positions, so `+` and `-` do not work on layouts where those characters live elsewhere. There is no platform modifier token, so `multiSelection` defaults are computed with `getOS()` and cannot be expressed by the user, and modifier combinations cannot be written at all.

## Required behavior

- Binding grammar: `[<Modifier>+]*<Key>`. Modifier tokens: `Mod`, `Control`, `Meta`, `Alt`, `Shift` (case-insensitive, any order). `Mod` resolves to `Meta` on macOS and `Control` elsewhere.
- Key tokens: `KeyboardEvent.key` values (`Delete`, `ArrowUp`, `Enter`, `' '` or `Space`, `+`, `=`, `-`, `0`, letters). Single characters compare case-insensitively. `code:<code>` compares `KeyboardEvent.code` instead (`code:Space`, `code:KeyW`, `code:NumpadAdd`).
- Modifiers must match exactly: an unspecified modifier must be released. On macOS, a binding with `Mod` also accepts `metaKey` when the OS reports `ctrlKey` false; a binding with `Meta` and one with `Mod` are equivalent there.
- Modifier entries (`modifiers` section) name modifier keys themselves (`'Shift'`, `'Mod'`, `'code:Space'`); they are matched on keydown/keyup by `key` or `code` the same way and must not carry other modifiers.
- Defaults: `selection: ['Shift']`, `multiSelection: ['Mod']`, `panActivation: []`, `zoomActivation: []`, `select: ['Enter', 'Space']`, `clearSelection: ['Escape']`, `delete: ['Delete', 'Backspace']`, `moveUp: ['ArrowUp']` and the other three arrows, `panUp: ['ArrowUp']` and the other three, `zoomIn: ['+', '=', 'code:NumpadAdd']`, `zoomOut: ['-', 'code:NumpadSubtract']`, `fitView: ['0', 'code:Numpad0']`.
- A pure parser `parseBinding(binding): ParsedBinding` and matcher `matchesBinding(parsed, event, platform)` in `utils/`, exported for application use.
- Dev-mode warnings: unknown modifier token, a binding with two non-modifier keys, the same binding in two entries of different sections.
- Browser shortcuts stay untouched: a command binding without modifiers never fires while `ctrlKey`, `metaKey` or `altKey` is held; bindings that name those modifiers do fire and `preventDefault`.

## Acceptance

- Unit tests for the parser and matcher cover: case, `Space` alias, `code:`, `Mod` on both platforms, exact modifier matching, macOS Meta carve-out, invalid inputs.
- Existing keyboard specs pass with the new defaults after replacing `Equal`/`Minus` in test key dispatches by `key` values.
- An e2e test types `+`/`-` on a non-US layout via Playwright's `keyboard.press` with `key` and `code` divergence (or a synthetic event) and gets the zoom.
