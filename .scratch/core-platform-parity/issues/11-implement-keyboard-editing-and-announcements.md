# Implement keyboard editing and live announcements

Status: wontfix
Tier: critical-parity
Depends on: 01, 09, 10

## Problem

A focusable graph is still incomplete if users cannot create connections, request deletion, or receive understandable feedback about editing actions without a pointer.

## Current decision — 2026-09-05

The user requested rolling back this implementation after reviewing keyboard connection mechanics in other libraries. Keyboard connection creation is unsupported for now. Issue 11's implementation, including its deletion-request API, action announcements, tests and demo, has been removed; issue 10's keyboard navigation remains.

The proposal below is archived, not an active implementation contract. Reopen only after agreeing on a new interaction design. General-purpose interaction feedback and application-owned guidance must be considered separately; no instructional panel is required in the graph.

Research is retained: [React Flow](../react-flow-keyboard-editing-and-announcements.md), [other graph libraries](../keyboard-connection-patterns.md).

## Archived proposal

### Handle focus and navigation

- Include handles in native Tab/Shift+Tab traversal within each node, alongside embedded controls in DOM order. Preserve issue 10's node input order followed by edge input order and ordinary exit from the graph. There is no separate handle-entry mode.
- A handle participates in Tab traversal when resolved capability policy permits starting or accepting a connection. Skip fully unavailable handles while retaining their readable descriptions. Parent-node wrapper focusability does not determine handle focusability; accept-only handles remain reachable.
- Preserve the independent behavior of embedded controls and the existing vflowNoKeyboard opt-out. Graph commands originate on the focused library wrapper or handle itself, not its custom descendants.
- Apply autoPanOnNodeFocus when keyboard focus reaches a handle, using its owning node's absolute bounds. Reuse issue 10's policy: center a fully offscreen node immediately without changing zoom, leave partially visible nodes in place, and honor the existing setting. Do not add another setting.
- When a focused handle disappears or loses focus eligibility, recover focus to the next eligible element in traversal order, then the previous, then the flow container. Do not steal focus from elsewhere.

### Keyboard connection attempt

- Enter/Space on a start-eligible handle begins an attempt; Tab/Shift+Tab traverses normally; Enter/Space on another handle attempts completion. Preserve selection throughout connection navigation, completion, and cancellation.
- Reuse existing handle capability policy, connection mode, endpoint normalization, and the global validator. Start eligibility and source/target kind remain separate concepts.
- Check the focused destination and announce its validity. Keep eligible but invalid candidates in native traversal order. An invalid confirmation keeps the attempt active so the user can try another destination; it does not complete an invalid connection.
- Recheck eligibility and validity before completion. If the originating handle disappears or loses start eligibility, cancel. If only the candidate disappears, return to searching; an unavailable candidate cannot complete the connection.
- Show the preview only while a valid destination handle is focused. Hide it for invalid candidates and ordinary nodes/controls, preserving the active attempt. Reuse existing connection rendering/customization.
- The cancel command, focus leaving the flow, or loss of the originating handle cancels the attempt. Successful completion and cancellation preserve current focus unless focus recovery is needed because its element disappeared or became ineligible.
- Cancel an unfinished keyboard attempt before another graph editing command or a pointer interaction begins. Pointer movement alone must not change the candidate, preview, or attempt. Embedded controls retain their own keyboard behavior.

### Shortcuts and conflicts

Extend the existing keyboardShortcuts input with these actions:

| Action           | Default physical event.code alternatives | Scope                                                     |
| ---------------- | ---------------------------------------- | --------------------------------------------------------- |
| connect          | Enter, Space                             | Start or confirm on a focused handle                      |
| cancelConnection | Escape                                   | Cancel an active attempt from a focused wrapper or handle |
| delete           | Delete, Backspace                        | Request deletion from a focused node/edge wrapper         |

- Retain arrays as alternative physical keys; null disables an action. Preserve existing selection, multiselection, pan, and zoom settings and fixed wrapper selection/movement commands. Tab remains native. Do not add chord syntax or a generic command registry.
- Among applicable new commands sharing a key, cancellation precedes connection, then deletion. Existing selection/movement commands retain precedence on wrappers, except that cancellation during an active connection takes precedence over deselection.
- With defaults, Escape during an active attempt only cancels it and preserves selection. A subsequent Escape on a node/edge wrapper follows the existing deselection behavior. Custom controls' Escape is not intercepted.

### Application events and state ownership

- Emit one existing connectStart event when an attempt starts, connect upon valid confirmation, and one connectEnd when it completes or is cancelled. Candidate traversal and invalid confirmations do not emit another start or end event.
- Keep existing event payloads: successful completion uses connectEnd with valid: true and endpoints; cancellation uses valid: null and a null target. Do not introduce keyboard-only connection events or structural collection mutation.
- Add deleteRequest with { nodeIds, edgeIds }, containing the selected IDs only. Emit once per press of a configured deletion key; ignore empty selection and key auto-repeat. Focus alone does not select entities for deletion, and handle focus does not initiate deletion.
- The application may ignore deleteRequest or apply its own policy and existing removeNodes/removeEdges helpers, including cascades. Core does not expand the request into a removal closure, clear selection, or claim that deletion succeeded.

### Localized announcements

- Retain one existing polite, atomic live region per flow and the existing ariaLabelConfig localization mechanism. Accessible names/descriptions provide native focus speech without an additional focus message through the live region.
- Report keyboard-originated selection, movement, connection actions/validity, and deletion requests. Pointer gestures and application-originated changes do not generate these action messages. Descriptions and shortcut instructions reflect the implemented, configured actions.
- Update the live region directly, without the proposed 200 ms delay, timed throttling, special coalescing, or an announcement queue. Avoid duplicate writers for one action and use actual movement/selection results rather than replaying general signal-change notifications.
- Describe deletion as a request. Connection completion reports the confirmed interaction; it does not promise that the application added an edge. Keyboard resize announcements arrive with issue 14's keyboard resizing.

## Archived acceptance

- A keyboard-only user can start, complete, retry an invalid target, and cancel connections between default/custom handles, while retaining native traversal and application-owned selection.
- Public-contract and browser tests cover independent start/accept eligibility, handles of nonfocusable nodes, invalid targets, global validation, changing/removing participants, valid-only previews, graph exit, focus recovery, and focus auto-pan using the existing setting.
- Verify exactly-once connection lifecycle events, mixed pointer/keyboard transitions, configured/disabled/conflicting shortcuts, Escape precedence, embedded controls, and keyboard opt-out.
- Verify mixed node/edge deleteRequest payloads, empty selection, auto-repeat, and an ignored deletion request without collection or selection mutation.
- Verify localized, concise keyboard action messages, direct live-region updates, native focus descriptions, and independent flow instances. Pointer and application updates must not produce action speech.
- Document the API, default commands, customization, example application handling of connect/deleteRequest, and the inherited virtualization limitation.
- Record actual VoiceOver verification of keyboard connections, cancellation, deletion requests, and announcements, including versions and observed limitations. Check an additional browser/screen-reader combination when available. Document unavailable or unperformed checks honestly; prior issue 09 MVP acceptance does not establish a passed check for this issue.

## Out of scope

- Undo/redo, clipboard, and a generic application command registry.
- Voice control.
- Application-defined workflow semantics.
- Keyboard resize/reconnection controls and resize announcements (issue 14).
- Compatibility with the current virtualization implementation or navigation to unrendered entities, continuing issue 10's documented limitation.
- A public arbitrary-announcement API, announcement scheduling configuration, and new focus-pan settings.

## Comments

### Grilling — 2026-09-05

- Q1 accepted: include handles in ordinary native Tab traversal within each node, alongside embedded controls in DOM order, before proceeding to the next node. Do not introduce a separate handle-entry mode. Exact handle focus eligibility remains to be specified.
- Q2 accepted: announce keyboard-originated actions in issue 11; pointer gestures and application-originated changes do not generate action announcements. Native accessible names/descriptions provide focus speech without repeating it through the live region. Keyboard resize announcements arrive with issue 14.
- Q3 accepted: make new connection and deletion commands configurable while preserving existing selection/movement behavior and existing shortcut settings. Existing shortcut arrays retain their meaning as alternative physical keys, not chords. Exact new commands, defaults, configuration shape, and collision rules remain to be specified.
- Q4 accepted: Enter/Space on a handle starts a connection; ordinary Tab/Shift+Tab traverses potential destinations; Enter/Space on another handle attempts completion; Escape cancels. Preserve node/edge selection. Rejection, focus restoration, and leaving the flow remain to be specified.
- Q5 remains open: the user requested checking React Flow before deciding handle Tab eligibility, including independent start/accept capabilities and the relationship to parent-node focusability.
- Q6 accepted: Delete and Backspace on a focused node/edge wrapper emit selected nodeIds and edgeIds once per press. Ignore empty selection and key auto-repeat. The application owns collection updates and cascade handling through existing helpers; announce a deletion request rather than claiming deletion completed. Behavior during a connection session or on a focused handle remains to be specified.
- Q7 tentative: the user provisionally supported a single movement announcement after a 200 ms pause, group movement counts, one selection message per command, and immediate connection/deletion-request messages that supersede pending movement speech, but requested React Flow research before settling this policy.
- Q5/Q7 research: React Flow at `0a1f9575b25679f2880175de8d3eae21aedde921` has no built-in handle Tab/keyboard connection workflow. Its assertive atomic live region is updated only by keyboard node movement, immediately and without a coalescing policy; it uses pre-movement coordinates and has no built-in selection/connection/deletion action writers. Default deletion uses Backspace with a document-level listener. See [pinned-source findings and proposed ngx-vflow policies](../react-flow-keyboard-editing-and-announcements.md). This evidence does not settle Q5/Q7 or change accepted Q4/Q6.
- Q5 accepted after research: include a handle in native Tab traversal when resolved policy permits starting or accepting connections. Skip fully unavailable handles while retaining readable descriptions. Parent-node wrapper focusability does not determine handle focusability.
- Q7 revised after research: omit the proposed 200 ms delay and special announcement coalescing. Use direct live-region updates for the keyboard actions already accepted in Q2; retain the existing polite region. This supersedes the tentative timed scheduling policy above, without dropping Q2's action announcements.
- Q8 accepted: preserve native Tab order for eligible handles, including candidates invalid for the current connection, and announce current-target invalidity. An Enter/Space attempt on an invalid candidate keeps the keyboard connection active so the user can try another target; it does not finish the interaction as an invalid pointer release currently does.
- Q9 accepted: Escape, focus leaving the flow, or removal/loss of start eligibility of the originating handle cancels the keyboard connection. Successful completion and cancellation preserve current focus. If only the candidate disappears, return to searching. When a focused handle disappears, recover to the next eligible element, then the previous, then the flow container.
- Q10 remains open: the user requested checking React Flow's preview-line behavior before deciding whether a keyboard connection line should follow focused handles (including invalid candidates) and hide while focus is elsewhere.
- Q11 accepted: extend keyboardShortcuts with connect (Enter/Space), cancelConnection (Escape), and delete (Delete/Backspace), retaining arrays of alternative physical keys and null to disable a command. Tab remains native. Among conflicting new commands, cancellation precedes connection, then deletion; existing wrapper selection/movement commands retain priority on wrappers.
- Q12 accepted: cancel an unfinished keyboard connection before another graph editing command or a pointer interaction begins. Pointer movement alone does not affect the keyboard connection. Embedded controls retain their independent keyboard behavior.
- Q10 research: React Flow's pointer preview snaps to a valid candidate; without a candidate or with an invalid candidate it follows the pointer. Its click-to-connect waiting state renders no preview line, and it has no built-in keyboard counterpart. See [preview-line source findings](../react-flow-keyboard-editing-and-announcements.md). Proposed after research, not yet accepted: show the keyboard preview only for a valid focused target and hide it otherwise while preserving the active connection and invalid-target announcements. This replaces the earlier proposal to draw a line to invalid keyboard targets; ngx-vflow currently has no distinct built-in invalid-line styling.
- Q10 accepted after research: show the keyboard connection preview only while a valid destination handle is focused. Hide it for invalid candidates and ordinary nodes/controls, retaining the active connection and Q8's invalid-target announcements. Reuse existing connection rendering and customization.
- Q13 accepted: reuse connectStart/connect/connectEnd with one start per attempt and one end on completion/cancellation. Invalid candidates do not restart or end the attempt. Add deleteRequest: { nodeIds, edgeIds }; structural changes remain application-owned.
- Q14 accepted: while a connection is active, its cancellation command takes precedence over wrapper deselection. Default Escape cancels without clearing selection; the next wrapper Escape follows existing deselection behavior. Embedded control keys remain independent.
- Q15 accepted: apply the existing autoPanOnNodeFocus policy to a keyboard-focused handle's owning node, including handles on nonfocusable wrappers. Center fully offscreen nodes at unchanged zoom, preserve partially visible nodes, and add no new setting.
- All questions Q1–Q15 are settled. The consolidated contract above awaits final shared-understanding confirmation; implementation has not started in this grilling session.
- The user confirmed the consolidated contract and invoked implement. Implementation, public-contract TDD, code review, and a commit on the current branch are authorized. Implementation-start commit: 6ae8ab65160d6759adc6635dccf4e58cb0e1c5da.

## Answer

Rolled back at the user's request on 2026-09-05. Keyboard connection creation remains unsupported. The earlier implementation and test results describe a discarded version, not current capability. No manual VoiceOver acceptance check is pending for that discarded implementation.
