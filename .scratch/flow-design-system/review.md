# Implementation review

Baseline: `1c3e2d06056a329d78910eba1e57d6a300936ec0`. Reviewed the complete working diff against this task-start commit, including the staged implementation. Two independent review agents inspected standards and the supplied plan/contract.

## Standards

Initial P1: removing default nodes also removed persistent core-only selection feedback, contrary to ADR-0006. Fixed on the core wrapper with `--vflow-selection`, while keyboard focus retains its own outline. The reviewer confirmed closure. The built-package test selects a custom core-only node, blurs it and checks the visible outline; it passes without UI CSS.

Open findings: **0**.

## Spec

Initial P2: migrating default groups to an ordinary component changes Shift-drag behavior. Existing examples and the primary migration path now use `template-group`; the optional `VflowContainerNode` documents ordinary node gestures. The reviewer confirmed closure.

Initial P2: acceptance lacked focused checks for long names, typography, invalid ports, reduced motion and resized endpoints. These now run against the docs and built-package consumer. All pass. The reviewer confirmed the code coverage, subject to the then-running resize check; that check subsequently passed in all three CSS modes.

Open findings: **0**.

Final totals: Standards 0 open (1 resolved); Spec 0 open (2 resolved).
