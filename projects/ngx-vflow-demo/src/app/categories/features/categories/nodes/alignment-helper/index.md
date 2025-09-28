# {{ NgDocPage.title }}

The library supports **alignment lines** that help align nodes relative to each other. To enable this feature, pass the `[alignmentHelper]` input to the `VflowComponent`. Its value can be either:

- `true` – to enable the helper with default settings
- An `AlignmentHelperSettings` object – to configure the helper with custom settings

Try aligning the following flow:

{{ NgDocActions.demoPane("AlignmentHelperDemoComponent") }}
