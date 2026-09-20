# Expose resolved shortcuts and application-wide defaults

Status: needs-triage
Tier: 3.x-additive
Depends on: 01, 02

## Problem

Applications that render a cheat sheet or a settings panel have to duplicate the defaults and the merge logic. Every `vflow` instance repeats the same `[keyboardShortcuts]` binding.

## Required behavior

- `VflowComponent.resolvedShortcuts: Signal<ResolvedKeyboardShortcuts>`: the merged result after defaults, application-wide config and the input, per section, as the binding strings and their formatted labels (issue 04's formatter). The parsed form stays internal, so the signal exposes strings only.
- `provideVflow({ keyboardShortcuts })` (or extend the existing provider if one exists) sets application-wide defaults; the input of a single flow overrides per entry.
- The default config is exported as `DEFAULT_KEYBOARD_SHORTCUTS`.
- `KeyboardCommandName` union and a `KEYBOARD_COMMANDS` list with `scope` metadata are exported so that a cheat sheet can group commands.

## Acceptance

- A test provides application-wide shortcuts, overrides one entry on a flow, and reads both through `resolvedShortcuts()`.
- The docs cheat sheet demo (issue 06) is built only from `resolvedShortcuts()`.
