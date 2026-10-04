import { booleanAttribute, Directive, input } from '@angular/core';

/**
 * Scope a theme to consumer DOM, including the flow's HTML and SVG layers, markers, toolbars and minimap.
 * `light` and `dark` ship with the stylesheet; any other name selects a `[data-vui-theme='name']` scope you define.
 */
@Directive({ selector: '[vuiTheme]', host: { '[attr.data-vui-theme]': 'vuiTheme()' } })
export class VuiTheme {
  readonly vuiTheme = input<'light' | 'dark' | (string & {})>('light');
}

/** Interaction state owned by core: bind selection/preselection from the template context. */
@Directive({ selector: '[vuiSelected]', host: { '[attr.data-vui-selected]': 'vuiSelected()' } })
export class VuiSelected {
  readonly vuiSelected = input(false, { transform: booleanAttribute });
}
