# Accessibility verification — issue 09

Scenario: the documentation page `/interactions/accessibility`, containing two flows with repeated node IDs, default/custom nodes and edges, a resizable visual group, a custom button, handles and one minimap.

## Automated checks

- `npx ng test ngx-vflow-lib --no-watch --no-progress --browsers=ChromeHeadless --include='**/accessibility.spec.ts'`: public inputs/factories → rendered roles, names, descriptions, reactive updates, safe metadata, custom button and independent description cleanup/live regions.
- `npx playwright test e2e/accessibility.spec.ts --reporter=line`: real pointer connection gestures, idle/valid/invalid candidate descriptions, capability restrictions, localization and native button activation. axe runs over the example in idle, valid and invalid states without disabled rules.
- Both targeted checks passed on 2026-09-05. axe reported zero violations in those states. This is scoped to the example, not the documentation site's unrelated navigation shell.
- Final regression run on 2026-09-05: all 164 library tests and all 4 Playwright tests passed. `npx ng build ngx-vflow-lib` built both the main library and `ngx-vflow/testing`. Commit hooks passed ESLint and Prettier for changed files.

## VoiceOver + Safari: incomplete

Attempted on 2026-09-05 with macOS 26.6.2 (25G83), Safari 26.6.2 and bundled VoiceOver 10. Safari was opened at the scenario using native computer-use controls. Its accessibility tree exposed Review graph and Reference graph, named groups, both edge names and endpoint help, an independent Review request button, and the minimap image. Switching language updated the first graph while the reference graph retained its name.

This was an accessibility-tree inspection, **not a completed manual VoiceOver reading pass**. VoiceOver was enabled for the attempt, but repeated attempts to obtain its spoken-text/caption panel through the computer-use tool failed with `timeoutReached`. Speech could not be verified, so no reading or announcement result is marked passed. No scripted speech or DOM assertions are substituted for that missing observation.

VoiceOver was switched off after the attempt, restoring its initial state; the off switch was verified in System Settings.

The remaining manual check must use VoiceOver navigation to read both graph regions, default/custom entities, Request's parent/selection/unavailable actions, edge endpoints, handles and the minimap, then reach and activate Review request. Record the actual spoken output, navigation issues and any duplicate/missing descriptions. Use VoiceOver help-text reading when necessary for `aria-describedby`. Also check language changes and independent references across both graphs.

NVDA + Chrome is unavailable on this macOS host. No second screen-reader combination was tested. Keyboard graph navigation, action announcements, minimap operation and accessible resize/reconnect remain the explicit scope of issues 10–14.
