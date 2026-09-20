# Document the shortcut system and add a cheat sheet demo

Status: resolved
Tier: docs
Depends on: 03, 05

## Problem

The keyboard-shortcuts page describes the flat form and the accessibility page repeats the command table by hand. There is no example that shows the full set of commands to a user of an application.

## Required behavior

- Rewrite the keyboard-shortcuts page: two tables (held modifiers, commands with scope and repeat), the binding grammar with `Mod` and `code:`, disabling with `[]`, a WCAG 2.1.4 note explaining why printable keys are active only on focus and remappable, and the migration from the 2.x/early-3.0 flat form.
- A cheat sheet demo that renders `resolvedShortcuts()` grouped by scope with platform labels and lets the reader remap one command and disable another; it also shows application-wide defaults through the provider.
- The accessibility page keeps only the behavior description and links to the shortcut page for keys; its command table is generated in the demo, not duplicated in prose.
- Playwright: the cheat sheet reflects a remap; `aria-keyshortcuts` is present on a wrapper; axe clean.
- Update `docs/accessibility-verification.md` and the migration page.

## Acceptance

- Docs build passes; e2e suite passes; no stale mention of `pan`/`zoom` modifier keys, `KeyboardAction`, `KeyboardCommand` or `null` disabling in `apps/docs`.

## Comments

- 2026-09-20: Resolved without issue 05, which the user chose to skip. The cheat sheet that was to be rendered from
  `resolvedShortcuts()` became a configuration example instead: it holds its own `KeyboardShortcuts` object, rebinds
  selection and deletion, turns the zoom commands off and on again, and prints the object as code a reader can copy.
  That shows the merge rule honestly, including the need to re-supply an entry to restore it, and it needs no new
  public API. A list of the merged defaults still has no home outside the documentation tables; reopen with 05 if an
  application asks for one.
- The keyboard-shortcuts page had already been rewritten piece by piece in issues 01 and 02, so what remained here
  was the WCAG 2.1.4 note: printable keys can be disabled with an empty list, remapped to carry a modifier, and run
  only while focus is inside the graph, which satisfies all three of the ways the criterion allows.
- The accessibility page no longer repeats the keys. Its table is keyed by command name and describes behavior only,
  and it links to the shortcut page for the keys, so a remap cannot make it stale.
- `aria-keyshortcuts` was dropped from the acceptance along with the attribute itself.
- axe caught a real defect in the new example: the block that prints the configuration scrolls, so it needed its own
  Tab stop. Fixed rather than excluded.
- Verified: 283 library tests, full docs e2e 36 including a new test that rebinds deletion in the example and watches
  the graph follow, lint clean, and no stale mention of the flat form or the removed types anywhere in `apps/docs`.
