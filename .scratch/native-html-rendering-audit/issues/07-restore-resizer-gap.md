# Restore the resizer gap input

Status: ready-for-agent
Priority: P1

## Problem

The public `ResizableComponent.gap` input and its testing mock disappeared during the HTML resizer rewrite. This was not an agreed v3 API removal, and existing `[gap]` bindings now fail Angular template compilation.

Relevant code:

- `projects/ngx-vflow-lib/src/lib/vflow/public-components/resizable/resizable.component.ts`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/resizable/resizable.component.html`
- `projects/ngx-vflow-lib/src/lib/vflow/public-components/resizable/resizable.component.scss`
- `projects/ngx-vflow-lib/testing/src/component-mocks/resizable-mock.component.ts`

## Required behavior

- Restore `gap` as a public numeric input with default `1.5`.
- Preserve the old meaning: resize lines and handles are offset outward from the node boundary by the configured number of CSS pixels.
- Apply the offset through HTML/CSS positioning without reintroducing SVG controls.
- Keep the testing mock aligned with production metadata.

## Acceptance

- Existing `[gap]="n"` templates compile.
- Default controls render 1.5 px outside the node boundary; custom values move every line and corner consistently.
- Gap remains visually correct with `autoScale`, all resize directions, and non-unit viewport zoom.
- Focused resizer tests, testing-entrypoint build, library tests, and library build pass.

## Comments
