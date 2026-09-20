# Keyboard shortcuts configuration

Redesign of the `keyboardShortcuts` input of `vflow` based on the survey of 40 solutions in [core-platform-parity/keyboard-shortcut-config-survey.md](../core-platform-parity/keyboard-shortcut-config-survey.md) and the ideal sketched on 2026-09-20.

## Goal

One declarative, layout-aware, self-describing shortcut configuration:

- the config shape shows the difference between held modifiers and pressed commands;
- bindings are written the way people write them everywhere else (`'Mod'`, `'+'`, `'Delete'`, `'code:Space'`);
- one resolver decides which command a key press runs and where;
- instructions for assistive technology and the application's cheat sheet come from the same resolved bindings.

## Current state (3.0 branch, 2026-09-20)

`KeyboardShortcuts = Partial<Record<KeyboardAction | KeyboardCommand, null | string[]>>` where `KeyboardAction = 'multiSelection' | 'selection' | 'pan' | 'zoom'` are held modifiers and `KeyboardCommand = 'delete' | 'zoomIn' | 'zoomOut' | 'fitView'` are commands. Matching is by `event.code` only. Node movement and viewport panning by arrow keys are fixed. Instructions are static strings in `AriaLabelConfig`. Two directives (`KeyboardEntityDirective`, `KeyboardNavigationDirective`) each own part of the dispatch and coordinate through `stopPropagation` and `hasShortcut`.

## Decisions

1. Two sections, `modifiers` and `commands`, in one `KeyboardShortcuts` object. `KeyboardAction` and `KeyboardCommand` leave the public API.
2. `pan` and `zoom` become `panActivation` and `zoomActivation`; `selection` and `multiSelection` keep their names.
3. A binding is a string: optional modifier tokens joined by `+` and one key. Keys match `KeyboardEvent.key`; single characters match case-insensitively; `code:` prefixes a physical key. `Mod` is Meta on macOS and Control elsewhere. Modifiers match exactly, with the macOS Meta carve-out.
4. An empty array disables an entry. `null` is no longer accepted.
5. No key sequences. No simultaneous non-modifier chords.
6. Every command declares its scope: entity wrapper, graph container, or both. One resolver maps a key press to at most one command and stops there.
7. Directional commands are explicit entries (`moveUp` … `panRight`) so that they can be remapped or disabled like everything else; `Shift` acceleration stays fixed.
8. Instructions and `aria-keyshortcuts` are rendered from resolved bindings; the application reads the same `resolvedShortcuts()` signal for its own help.
9. Single printable keys stay active only on a focused wrapper or the container and remain remappable and disableable, which satisfies WCAG 2.1.4 in all three ways.

## Non-goals

- Key sequences, wildcard bindings, regular expressions in bindings.
- A command registry for application commands, undo/redo, clipboard.
- Per-platform binding maps (`{ mac, win }`); `Mod` and `code:` cover the known cases.
- Global (document-level) listeners; commands keep working only from focus inside the graph.

## Dependency order

| Phase                  | Issues                                                                                            | Release                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| A — shape and matching | 01 config shape; 02 key matching and defaults; 03 single resolver with scopes                     | 3.0, breaking, must land before the release |
| B — derived surfaces   | 04 generated instructions and `aria-keyshortcuts`; 05 `resolvedShortcuts()` and app-wide defaults | 3.x, additive                               |
| C — documentation      | 06 documentation, demo cheat sheet and e2e                                                        | with each phase, finalized after 05         |

## Issues

1. [Restructure the shortcut config into modifiers and commands](issues/01-restructure-shortcut-config.md)
2. [Match bindings by key with Mod and code prefixes](issues/02-match-bindings-by-key.md)
3. [Resolve every key press through one scoped dispatcher](issues/03-single-scoped-resolver.md)
4. [Generate instructions and aria-keyshortcuts from bindings](issues/04-generate-instructions-from-bindings.md)
5. [Expose resolved shortcuts and application-wide defaults](issues/05-expose-resolved-shortcuts.md)
6. [Document the shortcut system and add a cheat sheet demo](issues/06-document-shortcuts.md)
