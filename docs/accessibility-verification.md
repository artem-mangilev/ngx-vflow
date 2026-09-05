# Accessibility verification — issue 09

Scenario: the documentation page `/interactions/accessibility`, containing two flows with repeated node IDs, default/custom nodes and edges, a resizable visual group, a custom button, handles and one minimap.

MVP acceptance decision, 2026-09-05: the user accepted the implementation as sufficient for MVP and closed issue 09 as resolved. The limitations below remain recorded; this decision does not turn incomplete or unsuccessful checks into passes.

## Automated checks

- `npx ng test ngx-vflow-lib --no-watch --no-progress --browsers=ChromeHeadless --include='**/accessibility.spec.ts'`: public inputs/factories → rendered roles, names, descriptions, reactive updates, safe metadata, custom button and independent description cleanup/live regions.
- `npx playwright test e2e/accessibility.spec.ts --reporter=line`: real pointer connection gestures, idle/valid/invalid candidate descriptions, capability restrictions, localization and native button activation. axe runs over the example in idle, valid and invalid states without disabled rules.
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
