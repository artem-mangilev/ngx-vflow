# Establish graph accessibility semantics

Status: resolved
Tier: critical-parity
Depends on: 01

## Problem

The rendered graph has no documented accessibility contract for graph entities, handles, the minimap, or status feedback. Custom node content cannot repair missing wrapper semantics, graph relationships, or localized descriptions.

This issue establishes readable graph semantics. It does not claim full keyboard accessibility: focus/navigation belongs to issue 10, keyboard connections and action announcements to issue 11, minimap interaction to issues 12–13, and accessible resize/reconnect controls to [issue 14](14-implement-accessible-resize-and-reconnect.md). See [ADR-0004](../../../docs/adr/0004-library-owned-accessibility-wrappers.md) for the wrapper ownership boundary.

## Public contract

- Expose a flow-level `ariaLabelConfig` input accepting partial overrides of English defaults. Use strings for fixed phrases and formatter functions for phrases with parameters. Every library-generated name, description, and instruction must be configurable and localizable.
- Add optional reactive `ariaLabel` and `ariaDescription` fields to nodes and edges, following their existing signal-based property model. Public `<handle>` components expose corresponding Angular inputs. Factories preserve supplied values and allow omitted names to use library fallbacks.
- An application-provided name overrides the generated name. An application-provided description supplements library-owned relationships and states rather than replacing them.
- Expose `domAttributes` on entity wrappers with an initial allowlist of `data-*`, `title`, `lang`, and `dir`. Reject unsupported keys in public types and ignore them at runtime.
- Wrapper IDs, roles, computed states, focus attributes, styles, and event handlers cannot be overridden through `domAttributes`. Naming and description customization uses the dedicated API. Consumers do not need knowledge of private DOM structure.
- Configuration and reactive entity metadata changes update rendered accessibility information. Multiple flow instances must keep their generated description references and live regions independent.

## Roles and reading structure

| Surface                            | Role     | Contract in issue 09                                                                            |
| ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| Flow                               | `region` | Named graph area; no new keyboard interaction model.                                            |
| Node, including visual group types | `group`  | Named wrapper; custom descendants retain their own semantics.                                   |
| Edge                               | `group`  | Named connection with readable endpoints; custom content remains available.                     |
| Handle                             | `group`  | Named connection point with readable capabilities and current candidate state; no new Tab stop. |
| Minimap                            | `img`    | One named image, default `Graph minimap`; no duplicate preview-node tree or Tab stop.           |

- Keep the graph's flat DOM structure. Do not introduce nested accessible ownership or rearrange DOM nodes to represent parenthood in this issue.
- A child node's description identifies its direct parent by accessible name. This applies to any parent node type, as required by ADR-0003; it is not limited to visual groups.
- An edge identifies its source and target by accessible name. Preserve this relationship information when the application supplies a custom edge name, without repeating identical endpoint text unnecessarily.
- Exclude library-generated decorative geometry and the auxiliary handle magnet from the accessibility tree. Never hide whole custom-content or `[resizable]` wrappers as a shortcut.
- Only describe implemented interactions. Do not add instructions for keyboard actions that will arrive in later issues.

## Default names

- Node: application-provided `ariaLabel`, then the standard node's text without HTML markup, then localizable `Node {id}` or `Group {id}`. A standard node without usable text uses the ID fallback.
- Do not inspect arbitrary custom component/template content to infer its name. Meaningful custom names remain the application's responsibility.
- Edge: a localizable phrase identifying a connection from the source node's accessible name to the target node's accessible name, unless overridden by `ariaLabel`.
- Handle: a localizable source/target connection-point name including its handle ID when present and its parent node's accessible name. Omit the ID segment when no handle ID exists. Applications may override this with a domain-specific name.

## State descriptions

- Capability policy gates individual interactions; it does not make an entire entity or its embedded controls disabled. Describe unavailable actions individually, without deriving whole-node `aria-disabled` from a denied capability.
- Describe actual selection with localized text such as `Selected`, not unsupported `aria-selected` on a `group` role. A node or edge may remain selected after acquiring selection becomes unavailable; report that state without mutating it.
- For handles, describe `canStart=false` and `canAccept=false` independently. A handle that cannot start a connection may still accept one.
- Describe a handle as a valid or invalid connection target only while it is the current checked candidate. Do not describe an idle handle as invalid. Read the existing capability/validation results rather than introducing a second connection validator.
- These descriptions are available for reading in issue 09. Automatic announcements of their changes belong to issue 11.

## Live-region foundation

- Provide one internal, initially empty live region per flow with `aria-live="polite"` and `aria-atomic="true"`.
- Do not add a public arbitrary-announcement method, or automatically announce each selection, movement, or connection-state change in this issue.
- Issue 11 owns action messages and the policy for coalescing frequent updates. The foundation must not introduce duplicate announcement sources.

## Custom-content responsibilities

- Applications provide meaningful names for domain-specific nodes and handles, and labels, roles, and keyboard behavior for their own controls.
- Library wrappers retain their semantics and state descriptions when custom content is used. Embedded buttons, inputs, edge-label controls, and other custom content remain independently accessible.
- Library-generated resize/reconnect controls and their keyboard operation are deferred to issue 14. Document the existing pointer-only limitation; do not claim those controls are accessible merely because their owning node or edge has a name.

## Acceptance

- Tests verify the documented roles, default names, custom overrides, parent/endpoint descriptions, and reactive localization for default and custom entities.
- Cover selected entities with selection denied, independent capability restrictions, visual groups and ordinary parent nodes, and idle/valid/invalid handle states.
- Verify allowed DOM attributes and rejection of attempts to override library-owned semantics or behavior.
- Verify that a custom button inside a node remains independently accessible and that two flows on one page have independent description references and live regions.
- Run axe in the existing Playwright setup against documented default/custom-entity scenarios. Passing automated checks does not establish full keyboard accessibility.
- Record an actual manual graph-reading check with VoiceOver + Safari, including browser/screen-reader versions, scenario, observed results, and limitations. Check a second combination such as NVDA + Chrome when available and record availability honestly. Do not replace manual results with automated assertions or mark an unperformed check as passed.
- Documentation covers the public API, defaults, localization, custom-content responsibilities, and the boundaries with issues 10–14.

## Out of scope

- New focus management, keyboard traversal, selection, or movement (issue 10).
- Keyboard connection workflow, action announcements, and announcement coalescing (issue 11).
- Minimap interaction and keyboard navigation (issues 12–13).
- Separate semantics and keyboard operation for library resize/reconnect controls (issue 14).
- A public API for arbitrary live announcements.
- Domain-specific descriptions generated from application data without caller input.
- Hidden-state accessibility semantics.

## Comments

### MVP acceptance — 2026-09-05

- The user accepted the implementation as sufficient for MVP and requested closing this issue as completed. This supersedes the open acceptance status recorded in the earlier comments below.
- The VoiceOver traversal skips and incomplete physical-keyboard verification remain documented limitations, not passed checks. They do not block this MVP closure. See [verification evidence](../../../docs/accessibility-verification.md).

### VoiceOver retry — 2026-09-05

- With explicit user permission, temporarily enabled VoiceOver's AppleScript interface and obtained actual spoken phrases. Verified both graph regions, default entities, parent/endpoint descriptions, selection/restrictions, minimap, custom-button activation, pointed custom-handle descriptions and reactive localization. Restored the temporary setting and disabled VoiceOver afterwards.
- Acceptance remains open: sequential cursor navigation skipped the custom edge and custom handle; the latter was readable by pointed inspection. Ordinary keyboard-event verification was blocked by macOS error `1002` for `osascript`. Keep `ready-for-human` for a physical VoiceOver keyboard reproduction; if confirmed, fix the traversal issue before resolving this ticket. See [the detailed retry observations](../../../docs/accessibility-verification.md).

### Implementation — 2026-09-05

- Implemented the public metadata/localization API, library-owned roles and descriptions, independent per-flow CDK description references, quiet live regions, safe DOM metadata, and current-candidate handle descriptions. Added the documentation example and public-contract/Playwright axe checks.
- Acceptance remains open only for an actual VoiceOver + Safari reading pass. Native Safari tree inspection and automated checks passed, but the computer-use tool could not retrieve VoiceOver's spoken-text panel. See [verification evidence and remaining manual scenario](../../../docs/accessibility-verification.md). The issue is `ready-for-human`, not resolved; no unperformed screen-reader check is marked passed.
- Final verification: 164 library tests, 4 Playwright tests (including axe), and library/testing package build passed. Two-axis code review found no Standards issues and one Spec acceptance gap: the manual reading check above.

### Grilling — 2026-09-05

- Q13 accepted: defer separate semantics and operation for library resize/reconnect controls, document the pointer-only limitation, preserve custom and `[resizable]` content, and track accessible resize/reconnect in a separate issue.
- Q14 accepted: public-contract tests plus axe in Playwright, an actual recorded VoiceOver + Safari reading check, a second browser/screen-reader combination when available, and explicit custom-button/two-flow scenarios. Issue 09 does not claim complete keyboard accessibility.
- Q1 accepted: issue 09 establishes readable graph semantics, localizable descriptions, and a live-region foundation. Focus management, keyboard selection, and movement stay in issue 10; keyboard connections stay in issue 11. Instructions must describe only implemented interactions.
- Q3 accepted: the library owns wrapper roles, computed accessibility states, and focus management. Applications may customize accessible names, descriptions, and safe additional attributes such as `data-*`; these must not override library-owned semantics or behavior. The exact public API and attribute allowlist remain to be specified.
- Q2 accepted: describe independently unavailable interactions through localizable descriptions rather than setting `aria-disabled` on an entire node when an individual capability is denied. Custom content remains independently operable. Report actual selection even when acquiring selection is no longer allowed. Exact state descriptions and handle-state mappings remain to be specified.
- Q5 accepted: accessible node names prefer an explicit application-provided name, then the standard node's text with HTML markup removed, then a localizable `Node {id}` or `Group {id}` fallback. Default edge names describe a connection from the source node's accessible name to the target node's accessible name. Do not infer names by inspecting arbitrary custom component content; meaningful custom names remain the application's responsibility. All generated phrases are localizable.
- Q6 accepted: until minimap interaction is implemented in issues 12–13, expose the minimap as one named image with the localizable default name `Graph minimap`. Do not expose its preview nodes as duplicate graph entities or add a Tab stop.
- Q4 accepted: preserve the flat graph structure and expose relationships through localizable text. A child node's description identifies its direct parent by accessible name; an edge identifies its source and target by accessible name using Q5's naming rules. Do not introduce nested accessible ownership or restructure the DOM in issue 09. Keyboard navigation remains in issue 10.
- Q7 accepted: the flow exposes a named `region`; nodes, visual groups, and edges expose `group` wrappers while custom descendants retain their own semantics. Expose actual selection through localizable description text rather than unsupported `aria-selected` on `group`.
- Q8 accepted: expose one flow-level `ariaLabelConfig` with partial overrides of English defaults, using strings and formatter functions for parameterized phrases. Add reactive node/edge `ariaLabel` and `ariaDescription` fields and corresponding handle inputs. Custom descriptions supplement library-owned relationships and states rather than replacing them.
- Q9 accepted: expose localizable descriptions for independently unavailable handle start/accept actions and for valid/invalid status only while the handle is the current checked connection candidate. Do not describe an idle handle as invalid. Automatic announcements and keyboard connection behavior remain in issue 11.
- Q10 accepted: `domAttributes` initially allows only `data-*`, `title`, `lang`, and `dir`. Names and descriptions use the dedicated fields. Do not allow this object to override library IDs, roles, states, focus attributes, styles, or handlers. Reject unsupported keys at the type boundary and ignore them at runtime.
- Q11 accepted: handles expose named `group` wrappers without new Tab stops in issue 09. Default localizable names identify source/target kind, handle ID when present, and the parent node's accessible name. Applications may supply meaningful custom names. Preserve custom descendants' semantics and exclude only the auxiliary connection magnet from the accessibility tree.
- Q12 accepted: provide one internal `aria-live="polite"`, atomic live region per flow instance. Do not add a public arbitrary-announcement method or automatic action announcements in issue 09. Issue 11 owns action messages and coalescing frequent updates.
- Q12 reference: React Flow renders one `aria-live="assertive"`, `aria-atomic="true"` region per flow while keyboard accessibility is enabled. Its selected-node arrow-key handler immediately writes a localized movement message to a single store string; the checked React source has no dedicated queue, throttling, or deduplication policy and no other action-announcement writers. There is no dedicated public `announce()` method, although generic `useStoreApi().setState()` can write the store field. See [A11yDescriptions](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/A11yDescriptions/index.tsx) and [NodeWrapper](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx).
- Q8 reference: React Flow exposes flow-level `ariaLabelConfig` with string keys and a callback for movement announcements, plus per-node/edge `ariaLabel`. It has no dedicated per-entity `ariaDescription` field; descriptions can be supplied through `domAttributes` using standard ARIA attributes. See [AriaLabelConfig](https://reactflow.dev/api-reference/types/aria-label-config), [Node type](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/types/nodes.ts), and [Edge type](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/types/edges.ts).
- Q9 reference: React Flow's [Handle implementation](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/Handle/index.tsx#L240-L278) exposes start/end eligibility and validity through CSS classes, with caller DOM props forwarded through `...rest`; it does not generate an accessible name, role, tab stop, or ARIA disabled/invalid state. Although the React documentation lists `handle.ariaLabel` in the shared configuration, this pinned React Handle does not consume it (the Svelte Handle does). Do not infer implemented React behavior from that config key alone.
- Q4 reference: at the same React Flow commit, [NodeRenderer](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/container/NodeRenderer/index.tsx#L43-L97) renders sibling node wrappers. Parenthood does not generate nested accessible ownership, relationship ARIA attributes, or a parent description. [EdgeWrapper](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/EdgeWrapper/index.tsx#L207-L216) defaults to `Edge from ${edge.source} to ${edge.target}` using node IDs, with an application `ariaLabel` override; its `aria-describedby` references shared keyboard help rather than graph endpoints.
- React Flow comparison (commit `0a1f9575b25679f2880175de8d3eae21aedde921`): node/edge wrappers do not automatically expose `aria-disabled` or `aria-selected`; node instructions are shared across the flow rather than derived from each node's selectable/draggable capabilities. Handles expose capability and connection-validity CSS classes without built-in ARIA states. See [NodeWrapper](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/NodeWrapper/index.tsx), [A11yDescriptions](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/A11yDescriptions/index.tsx), and [Handle](https://github.com/xyflow/xyflow/blob/0a1f9575b25679f2880175de8d3eae21aedde921/packages/react/src/components/Handle/index.tsx). This is reference behavior, not an accepted decision for ngx-vflow.
