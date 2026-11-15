A graph is hard to convey without sight: it is a picture of relations, and its editor is driven by a pointer. This
page explains how the library exposes a flow to assistive technology, and why it made the choices it did.

## A flat list of named groups

The flow is a named region, and every node and edge in it is a named `group` whose state sits in its description.
The tree is flat: a child node names its parent in its description instead of nesting inside it.

Nesting would look more faithful, but a screen reader announces every level a user enters and leaves, and a graph
with groups inside groups turns into a stream of "group, group, group". A flat list with "Parent: Platform." in the
description costs one phrase and keeps Tab order equal to the order of your `nodes` array, which you control.

For the same reason the preview nodes of the minimap are not exposed: they would be a second, unusable copy of the
graph.

## State lives in the description

A node that cannot be selected or moved says so in words, `Selection unavailable.` or `Movement unavailable.`,
and never through `aria-disabled` on its wrapper. `aria-disabled` on a container tells assistive technology that
everything inside is unavailable, and a node is often a form: its buttons and inputs must stay operable when the
node itself cannot be dragged.

Each entity also carries one short instruction, built from the keys bound at that moment and from what the entity
can do. An instruction that named a disabled command, or a key the application remapped, would be worse than none.

## Focus is not selection

Focus has its own indicator and never changes selection by itself. A keyboard user has to be able to walk through a
graph and read it without changing it, exactly as a pointer user can look at it. Selection is a separate command.

When the focused entity is removed, focus returns to the page and does not jump to a neighbour. Moving focus to
"the next node" would be a guess about what the user wanted, announced as if they had asked for it.

## Only keyboard commands are announced

A command that changes state reports it in a polite live region: what was selected, where a node moved, the new
zoom. Pointer and programmatic changes are silent. Someone who dragged a node saw it move; an announcement there
would only add noise for people who use a screen reader together with a pointer. Panning is silent as well, since
it changes nothing in the graph.

## Single-character keys

Several commands are bound to a printable character: `+`, `-`, `0`, and any letter you bind yourself. [WCAG 2.1.4](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html) asks that such a shortcut can be turned off, be remapped to include a non-printable key, or be active only while its component has focus, because speech input otherwise triggers it by accident. All three hold here: an entry takes an empty list, a binding may name `Mod`, `Control`, `Meta`, `Alt` or `Shift`, and a command runs only while focus is on a graph entity or on the graph container, never while the page is focused elsewhere or a field is being typed into.

## Limits

Handles are not exposed and cannot be operated from the keyboard, so creating and reconnecting edges needs a
pointer. Resize controls are pointer-only and the minimap has no Tab stop. An application that needs these without a
pointer has to offer its own controls, for example a "connect to…" menu on a node that adds the edge through
[graph operations](/docs/graph/graph-operations).

The checks that back these pages, automated and with a screen reader, are recorded in
`docs/accessibility-verification.md` of the repository. Automated checks alone do not establish screen-reader
usability.

## See also

- [Accessibility](/docs/interactions/accessibility) for the tasks.
- [Accessibility reference](/docs/reference/accessibility) for the roles, commands and labels.
