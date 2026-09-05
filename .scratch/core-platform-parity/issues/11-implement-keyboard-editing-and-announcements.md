# Implement keyboard editing and live announcements

Status: needs-triage
Tier: critical-parity
Depends on: 01, 09, 10

## Problem

A focusable graph is still incomplete if users cannot create connections, request deletion, or receive understandable feedback about editing actions without a pointer.

## Required behavior

- Add a keyboard workflow for starting, navigating, validating, completing, and cancelling a connection.
- Emit selected node and edge ids for application-owned deletion when a configured delete shortcut is pressed; core does not mutate the collections.
- Provide configurable shortcut mappings for editing actions without replacing existing selection modifiers silently.
- Announce focus, selection, movement, resize, connection validity/completion, and deletion shortcuts through localized live-region messages.
- Avoid duplicate announcements during high-frequency movement and selection changes.
- Respect handle capability policies and the global connection validator.

## Acceptance

- A keyboard-only user can create and cancel a valid connection between focusable handles.
- Invalid and disabled targets are skipped or announced according to the documented interaction model.
- Delete shortcuts emit selected node and edge ids without mutating application-owned collections; the application may ignore the event.
- Announcements are localized, concise, and throttled or coalesced where appropriate.
- Manual screen-reader verification covers at least VoiceOver and one additional documented browser/screen-reader combination when available.
- Browser tests cover connection success, rejection, cancellation, an ignored deletion event, and shortcut conflicts with embedded controls.

## Out of scope

- Undo/redo, clipboard, and a generic application command registry.
- Voice control.
- Application-defined workflow semantics.

## Comments
