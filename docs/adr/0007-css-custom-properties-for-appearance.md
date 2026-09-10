# Use CSS custom properties as the public appearance contract

Supersedes the styling-selector and no-component-token decisions in [ADR-0005](0005-independent-core-theme-contract.md). Shared semantic tokens and part-specific CSS custom properties are the public appearance contract; generated classes and internal DOM structure are implementation details, not styling API. This accepts a larger explicit token surface in exchange for stable customization without coupling applications to rendered markup.

Programmatic appearance inputs and styling fields are removed in favor of these variables; content, graph geometry and interaction settings remain application data/API. Appearance migration may proceed before removal of default presentations; the latter still requires the acceptance gate in [ADR-0006](0006-ui-presentations-core-interaction-feedback.md). Custom application HTML/SVG remains free to use application-owned classes and ordinary CSS.

Core stays independent of UI. Part variables fall back at their usage sites to shared semantic tokens and standalone defaults, so a variable inherited from an editor or node is not shadowed by a host-level default. Canvas resolves variables without measuring graph geometry and retains an explicit refresh for stylesheet/media changes.
