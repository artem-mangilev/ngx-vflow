# Generate instructions and aria-keyshortcuts from bindings

Status: needs-triage
Tier: 3.x-additive
Depends on: 02, 03

## Problem

`keyboardNavigation`, `keyboardSelect`, `keyboardDeselect`, `keyboardMove`, `keyboardDelete`, `keyboardPan` and `keyboardZoom` are static strings. A remapped or disabled command silently leaves its instruction wrong or requires the application to translate the sentence again. Nothing exposes `aria-keyshortcuts`.

## Required behavior

- Each `keyboard*` entry of `AriaLabelConfig` accepts `string | ((keys: KeyboardInstructionKeys) => string)`, where `keys` holds human-readable key lists per command (`keys.select === 'Enter or Space'`, `keys.zoomIn === '+ or ='`). Existing string values keep working; defaults become functions.
- A `formatBinding(binding, options)` utility renders a binding for people: platform glyphs on macOS (`⌘`, `⇧`), words elsewhere (`Ctrl`, `Shift`), `Space`, `Plus`; `code:` bindings render their key when known, otherwise the code. Localizable through a small map in `AriaLabelConfig` (`keyNames`).
- Wrappers and the container get `aria-keyshortcuts` built from the resolved bindings of the commands available in that scope, using the ARIA grammar (modifiers first, `Plus`, `Space`).
- Disabled commands drop out of both the instruction text and `aria-keyshortcuts`.

## Acceptance

- Unit tests: default instruction text follows a remap and a disable; a string override still wins; macOS and non-macOS formatting; `aria-keyshortcuts` grammar for `Mod+Enter`, `+`, `Space`.
- axe stays clean on the documentation examples with `aria-keyshortcuts` present.
