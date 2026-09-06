`@vflow/ui` is the optional design system for `ngx-vflow`, built with Tailwind CSS 4.
It is developed in this workspace and has not been published yet.

{{ NgDocActions.demo("DesignSystemDemoComponent", { container: false }) }}

Import `VflowButton` from `@vflow/ui` and `Vflow` from `ngx-vflow` in a standalone component.
Add `@vflow/ui/styles.css` to the application's global styles after installing the published package.
The stylesheet is precompiled: consumers do not need Tailwind or source scanning.
Utilities use the `vui:` prefix and omit Preflight so the design system can coexist with NgDoc.

```typescript file="./demo.component.ts"

```
