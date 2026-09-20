# Accessibility verification

Scenario: the documentation page `/interactions/accessibility`, containing two flows with repeated node IDs, default/custom nodes and edges, a resizable visual group, a custom button, handles and one minimap.

MVP acceptance decision, 2026-09-05: the user accepted the implementation as sufficient for MVP and closed issue 09 as resolved. The limitations below remain recorded; this decision does not turn incomplete or unsuccessful checks into passes.

## Automated checks

- `npx nx test ngx-vflow --watch=false --browsers=ChromeHeadless --include='**/accessibility.spec.ts'`: public inputs/factories → rendered roles, names, descriptions, reactive updates, safe metadata, custom button and independent description cleanup/live regions.
- `npm run e2e -- accessibility.spec.ts --reporter=line`: real pointer connection gestures, idle/valid/invalid candidate descriptions, capability restrictions, localization and native button activation. axe runs over the example in idle, valid and invalid states without disabled rules.
- Both targeted checks passed on 2026-09-05. axe reported zero violations in those states. This is scoped to the example, not the documentation site's unrelated navigation shell.
- Final regression run on 2026-09-05: all 164 library tests and all 4 Playwright tests passed. `npx ng build ngx-vflow-lib` built both the main library and `ngx-vflow/testing`. Commit hooks passed ESLint and Prettier for changed files.

## VoiceOver + Safari: partial; reading observations now available

Attempted on 2026-09-05 with macOS 26.6.2 (25G83), Safari 26.6.2 and bundled VoiceOver 10. Safari was opened at the scenario using native computer-use controls. Its accessibility tree exposed Review graph and Reference graph, named groups, both edge names and endpoint help, an independent Review request button, and the minimap image. Switching language updated the first graph while the reference graph retained its name.

This was an accessibility-tree inspection, **not a completed manual VoiceOver reading pass**. VoiceOver was enabled for the attempt, but repeated attempts to obtain its spoken-text/caption panel through the computer-use tool failed with `timeoutReached`. Speech could not be verified, so no reading or announcement result is marked passed. No scripted speech or DOM assertions are substituted for that missing observation.

VoiceOver was switched off after the attempt, restoring its initial state; the off switch was verified in System Settings.

### Retry — 2026-09-05

The user confirmed that VoiceOver speech was audible. Direct computer-use access to the VoiceOver app still returned `timeoutReached`. With the user's explicit permission, VoiceOver's AppleScript control was temporarily enabled. The installed VoiceOver scripting dictionary exposes `content of last phrase`; this returned actual screen-reader output. Navigation used VoiceOver's own cursor/commander commands and, for pointed inspection, its mouse cursor. No expected descriptions were injected into speech. Apple also documents [copying/repeating VoiceOver's last spoken phrase](https://support.apple.com/guide/voiceover/repeat-copy-or-save-the-last-spoken-phrase-vo2725/mac).

This was an agent-operated interactive screen-reader check, not a human keyboard-navigation pass. The graph was reloaded after enabling VoiceOver and Safari was explicitly activated before navigation. Switching apps disturbed the VoiceOver cursor, so results from other applications were excluded. The VoiceOver utility showed DOM navigation order enabled, with object grouping disabled.

| Scenario                          | Observed VoiceOver output / result                                                                                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Graph landmarks                   | `Review graph Request and its review. регион` and separately `Reference graph регион`.                                                                                                                                                    |
| Default edge                      | `Connection from Request to Approval Reconnection unavailable. пустой объект: группа`.                                                                                                                                                    |
| Visual group                      | `Review пустой объект: группа`; its resize wrapper did not hide it.                                                                                                                                                                       |
| Selected, nonselectable child     | `Request Needs approval. Parent: Review. Selected. Selection unavailable. Movement unavailable. группа`.                                                                                                                                  |
| Default handles                   | `Source connection point of Request` and `Target connection point of Request`, each announced as an empty group.                                                                                                                          |
| Minimap                           | One `Graph minimap изображение` item in the reading sequence; no preview-node sequence encountered.                                                                                                                                       |
| Embedded button                   | `Review request кнопка`; VoiceOver's `perform action` activated it. Safari then showed `Reviews: 1` (previously 0).                                                                                                                       |
| Custom handle, pointed inspection | `Accept request Inbound route. Starting connections unavailable. пустой объект: группа`. After activating the incoming-connections checkbox through VoiceOver, the description additionally included `Accepting connections unavailable.` |
| Reactive localization             | `Граф проверки Заявка и её проверка. регион`; the edge used `Связь от Request к Approval Переподключение недоступно.`; Request used `Родитель: Review. Выбран. Выбор недоступен. Перемещение недоступно.`                                 |
| Independent second graph          | After switching the first graph's language, VoiceOver still read `Reference graph` and `Copy Parent: Reference. группа`.                                                                                                                  |

**Unresolved traversal observations:** repeated sequential VoiceOver cursor movement skipped `Archive route` and the custom `Accept request` handle despite their presence in Safari's accessibility tree. Moving left from the pointed handle reached `Review request`; moving right again left the Approval group instead of visiting the handle. Pointed inspection confirmed the handle's speech, but custom-edge speech was not confirmed. Some traversals also skipped Archive, so the effect of cursor context must be isolated before attributing the skips to the library or Safari.

An attempted check using ordinary keyboard events through System Events failed with error `1002`: macOS did not allow `osascript` to send keystrokes. Accessibility permissions were not expanded to bypass that restriction. A follow-up check should use physical VoiceOver keyboard traversal of the same scenario, specifically the custom edge and custom handle; if the skips reproduce, fix the reading behavior and repeat the scenario. This follow-up does not block the user-approved MVP closure. Do not treat these observations as proof of full screen-reader usability, or dismiss reading-order problems as merely the deferred graph-keyboard feature.

After the retry, both the temporary VoiceOver AppleScript checkbox and VoiceOver itself were switched off and their off states verified in the UI. No library code changed during this retry.

NVDA + Chrome is unavailable on this macOS host. No second screen-reader combination was tested. Keyboard graph navigation, action announcements, minimap operation and accessible resize/reconnect remain the explicit scope of issues 10–14.

## Keyboard operation — issue 10, 2026-09-05

The same documentation page now also includes a dedicated keyboard example (`data-testid="keyboard-demo"`). The issue 09 observations above remain historical; entity wrappers now have the keyboard behavior specified in issue 10.

- Public-boundary tests exercise input-order traversal, focus independent of selection, replacement/toggle/clear selection, manual mode, capability restrictions, fixed/grid movement, parent extents, position notifications, ancestor/descendant selection, embedded controls, opt-out, focus removal/recovery, localization and focus auto-pan. The full library suite passed with 175 tests; the demo suite passed with 1 test.
- All 7 Playwright tests passed in Chromium. The new scenarios use real Tab/Shift+Tab, Enter, Space, modifiers and arrow keys; cover nodes, nested parents, non-focusable/non-selectable entities, native controls, custom edges, graph exit, removal of a node by its focused embedded button, manual selection, grid movement and independent focus-pan opt-out. axe checks of the accessibility and keyboard examples passed without disabling rules.
- Browser screenshots were inspected for distinct node and edge focus indicators. The editor demo keeps its embedded controls inside the visible graph. Focus pan preserves zoom and only centers fully offscreen nodes; it does not follow keyboard movement or edge focus.
- These checks are browser automation and visual inspection, not a new physical-keyboard or VoiceOver session. No new screen-reader result is claimed. Existing screen-reader limitations recorded above remain available for follow-up.
- Virtualization, action announcements, keyboard connections, minimap operation and resize/reconnect keyboard controls remain outside issue 10.

## Keyboard editing — issue 11 rollback, 2026-09-05

The user requested rolling back issue 11 after evaluating its interaction design and research into other graph libraries. Keyboard connection creation is currently unsupported. The issue 11 deletion-request API, action announcements, handle Tab stops, editing demo and related tests were also removed. Issue 10's keyboard navigation, selection and movement remain in place. Test results from the discarded implementation are not evidence of current support, and its pending VoiceOver check is no longer an acceptance task.

## Keyboard feedback, focus ring and shortcut keys — 2026-09-20

- Keyboard selection, clearing and arrow movement now write localized feedback to the flow's own polite, atomic live region (`selectionAnnouncement`, `selectionClearedAnnouncement`, `movedAnnouncement`). Pointer and programmatic changes stay silent. Unit tests cover the messages, the no-change case and localization; the browser check on the documentation page showed `Draft selected. 1 selected in total.` in the region after Enter.
- The node focus ring is divided by the new read-only `--vflow-zoom` variable of the zoomed viewport, so it stays 2px on screen. Verified in the browser at zoom 0.5: computed outline 4px, visible as a 2px ring.
- A key bound to a `keyboardShortcuts` action (for example `Space` for `pan`) is no longer consumed as a selection command by a focused entity. Unit test covers Space passthrough with `Enter` still selecting.
- Library suite: 269 tests passed; ESLint and Prettier passed for changed files. No new screen-reader session was run.

## Deletion requests and transparent handles — 2026-09-20

- `Delete` and `Backspace` on a focused node or edge emit `(deleteRequest)` once per press: the whole selection when the focused entity is selected, otherwise the focused entity alone (rule chosen after the research in `.scratch/core-platform-parity/keyboard-delete-focus-vs-selection.md`); `keyboardShortcuts.delete` configures or disables the keys and the matching instruction in entity descriptions. The library removes nothing. Unit tests cover the payload, auto-repeat, configured keys, `null` and the description; the Delete selected workshop applies the request with `removeNodes` and `removeEdges`.
- Handles are no longer exposed to assistive technology at all: the handle `ariaLabel`/`ariaDescription` inputs and the five handle-related label keys are removed after checking React Flow (plain `div` with `data-*` only), Foblex (ports absent from its semantics layer, keyboard connection works at node level) and ng-diagram (no port semantics). `domAttributes` still applies `data-*`. The accessibility example and its Playwright scenario now assert the absence of handle semantics and a working pointer connection.
- Library suite: 271 tests passed. Playwright `accessibility.spec.ts` and `keyboard-navigation.spec.ts`: 4 passed. No new screen-reader session was run.

## Keyboard viewport pan and zoom — 2026-09-20

- Arrow keys on a focused edge, on an unselected or immovable node, or on the graph container pan the view by 15 screen pixels (60 with Shift) in scroll direction; a selected movable node still moves instead. `Equal`/`NumpadAdd` and `Minus`/`NumpadSubtract` zoom by 1.2 around the view center within `minZoom`/`maxZoom`, `Digit0`/`Numpad0` fits the graph. Zoom commands announce the resulting scale through the live region; panning stays silent. Modifier combinations are left to the browser, keys from embedded content are ignored, and the commands are configurable through `keyboardShortcuts.zoomIn`, `zoomOut` and `fitView`.
- Unit test covers pan direction and acceleration, the precedence of node movement, zoom limits and announcements, fit view from the container, embedded content, browser shortcuts and disabled commands with their instruction. A Playwright scenario on the keyboard example repeats pan, Shift acceleration, node movement precedence, zoom with its announcement, fit view, `Control+Equal` and keys from an embedded text box with real key presses; all 4 keyboard tests and the full suite of 33 passed. No new screen-reader session was run.

## Keyboard shortcut configuration — 2026-09-20

- `keyboardShortcuts` moved to two sections, `modifiers` and `commands`, with an empty list as the way to disable an
  entry. Selection, clearing, node movement and viewport panning became configurable commands alongside deletion and
  zoom. Matching still uses `KeyboardEvent.code`; `select` gained `NumpadEnter` so numpad Enter keeps selecting.
- A disabled command now drops its instruction from the entity description, so what assistive technology reads matches
  what the keys do. The instruction sentences themselves are still static and can name keys that were remapped; issue 04
  of `.scratch/keyboard-shortcuts-2026-09-20` generates them from the resolved bindings.
- Verified by 272 library tests, including a new public-contract test for per-entry merging and disabling, and by the
  full docs e2e suite. No new screen-reader session was run.

## Layout-independent shortcut keys — 2026-09-20

- Shortcut bindings moved from `KeyboardEvent.code` to `KeyboardEvent.key`, with `Mod` for the platform primary
  modifier and a `code:` prefix for a physical key. `zoomIn` is now `+`, `=` and `code:NumpadAdd`, so zooming works on
  a layout that does not put those characters where a US keyboard does. A Playwright test zooms from `+` on
  `BracketRight` and `-` on `Slash`, the German layout positions.
- Control, Meta and Alt are matched exactly, which keeps browser and system shortcuts such as `Ctrl+0` working and
  replaces the blanket modifier guard the container directive used to carry. Shift stays free unless a binding names
  it, so accelerated movement and characters like `+` still reach their commands. The key bound as `multiSelection`
  does not block `select`, so holding it still toggles the focused entity.
- Verified by 277 library tests, including a parser and matcher spec, and by the full docs e2e suite of 35. No new
  screen-reader session was run.
