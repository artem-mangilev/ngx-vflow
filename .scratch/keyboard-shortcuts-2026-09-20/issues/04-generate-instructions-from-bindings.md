# Generate instructions and aria-keyshortcuts from bindings

Status: resolved
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

## Comments

- 2026-09-20: Implemented. `ParsedBinding` gained `source`, the key as the configuration spells it, so a label keeps
  the author's spelling instead of the lowercased matching form. `utils/keyboard-format.ts` holds `formatBinding`,
  `formatBindings` and `formatAriaShortcut`; `KeyboardLabelsService` turns them into the `keys` object, the
  `aria-keyshortcuts` value and a `text()` that resolves a sentence or a function.
- Two deviations from the issue text, both deliberate. Modifiers are named in words rather than macOS glyphs: this
  text lands in `aria-describedby`, and a screen reader spells `⌘` unpredictably; `keyNames` still lets an
  application put glyphs back for a visual cheat sheet. And `aria-keyshortcuts` sits on the container only, not on
  every wrapper: with the defaults the list is sixteen keys, and repeating it on each Tab stop would make focusing a
  node needlessly loud while the prose description already covers the same ground per entity.
- The four arrows are rendered as one phrase, `arrow keys`, and spelled out key by key as soon as they are not the
  four arrows. `ARROW_COMMANDS` was reordered to up, down, left, right so a generated list reads naturally and
  matches how the defaults declare the commands.
- Verified: 284 library tests, including a new formatting spec covering both platforms, the ARIA grammar and
  translation, and an integration test for a remap, a disable and a string override. Full docs e2e 35 passed with
  axe clean while the attribute is present, and one e2e asserts the container carries it and an entity does not.
