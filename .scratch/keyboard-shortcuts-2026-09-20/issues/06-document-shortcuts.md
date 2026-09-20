# Document the shortcut system and add a cheat sheet demo

Status: needs-triage
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
