import { booleanAttribute, Directive, input } from '@angular/core';

/**
 * Scope a theme to consumer DOM, including the flow's HTML and SVG layers, markers, toolbars and minimap.
 * `light` and `dark` ship with the stylesheet; any other name selects a `[data-vui-theme='name']` scope you define.
 */
@Directive({ selector: '[vflowTheme]', host: { '[attr.data-vui-theme]': 'vflowTheme()' } })
export class VflowTheme {
  readonly vflowTheme = input<'light' | 'dark' | (string & {})>('light');
}

/** Interaction state owned by core: bind selection/preselection from the template context. */
@Directive({ selector: '[vflowSelected]', host: { '[attr.data-vui-selected]': 'vflowSelected()' } })
export class VflowSelected {
  readonly vflowSelected = input(false, { transform: booleanAttribute });
}
