# Restructure the shortcut config into modifiers and commands

Status: resolved
Tier: 3.0-breaking
Depends on: —

## Problem

`keyboardShortcuts` mixes held modifiers (`selection`, `multiSelection`, `pan`, `zoom`) and pressed commands (`delete`, `zoomIn`, `zoomOut`, `fitView`) in one flat record, and the distinction leaks out as two exported types. `pan` and `zoom` read like commands next to `zoomIn`/`zoomOut`.

## Required behavior

- New shape:

  ```ts
  interface KeyboardShortcuts {
    modifiers?: Partial<Record<'selection' | 'multiSelection' | 'panActivation' | 'zoomActivation', string[]>>;
    commands?: Partial<Record<KeyboardCommandName, string[]>>;
  }
  type KeyboardCommandName = 'select' | 'clearSelection' | 'delete' | 'moveUp' | 'moveDown' | 'moveLeft' | 'moveRight' | 'panUp' | 'panDown' | 'panLeft' | 'panRight' | 'zoomIn' | 'zoomOut' | 'fitView';
  ```

- `[]` disables an entry; `null` is rejected by the type. Omitted entries keep their defaults; the input merges per section.
- `KeyboardAction` and `KeyboardCommand` are removed from `public-api.ts`; `KeyboardShortcuts` and `KeyboardCommandName` are exported. Internally the service keeps a list of modifier names for the held-state computation.
- `select` (Enter, Space), `clearSelection` (Escape), `moveX` (arrows) and `panX` (arrows) become configurable commands with today's behavior as defaults. Shift acceleration for move and pan is not configurable.
- Testing mocks in `ngx-vflow/testing` follow the new input type.
- Migration entry: old keys `pan`/`zoom` and the flat form are listed with their replacements; a dev-mode error names an old key when it is encountered.

## Acceptance

- Public-contract tests set each section independently, disable with `[]`, and verify that omitted entries keep defaults.
- The keyboard-shortcuts demo and its docs page use the new form.
- No `KeyboardAction`/`KeyboardCommand` in the built `index.d.ts`.

## Out of scope

- Matching semantics (issue 02) and dispatch (issue 03); this issue keeps `event.code` matching and both directives as they are, only reading from the new shape.

## Comments

- 2026-09-20: Implemented. `types/keyboard-action.type.ts` became `types/keyboard-shortcuts.type.ts` and exports
  `KeyboardShortcuts`, `KeyboardCommandName` and `KeyboardModifierName`; `KeyboardAction` and `KeyboardCommand` are gone
  from the built `index.d.ts`. The service resolves both sections eagerly, merges per entry, normalizes a non-array to an
  empty list and reports a former flat key through `console.error` in dev mode. `isActiveAction` became
  `isActiveModifier` and `hasShortcut` became `isModifierKey`, which now consults only the modifiers section, so a
  reserved key is skipped for every command rather than only for selection.
- Beyond the stated scope, the entity description now drops the instruction of any disabled command (`select`,
  `clearSelection`, move and pan), not only `delete` and zoom. Issue 04 replaces these sentences with generated ones.
- Matching still uses `event.code`, as planned. `select` gained `NumpadEnter` so that numpad Enter keeps working now
  that the key is matched by code rather than by `event.key`.
- Verified: 272 library tests, full docs e2e 34 passed on rerun (the virtualization spec is the known dev-mode flake,
  green in isolation and flagged flaky by Nx), ESLint and Prettier clean, `nx build ngx-vflow` succeeds.
