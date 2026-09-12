import { booleanAttribute, Directive, input } from '@angular/core';

/** Scope a theme to consumer DOM, including the flow's HTML and SVG layers. */
@Directive({ selector: '[vflowTheme]', host: { '[attr.data-vui-theme]': 'vflowTheme()' } })
export class VflowTheme {
  readonly vflowTheme = input<'light' | 'dark'>('light');
}

/** Interaction state owned by core: bind selection/preselection from the template context. */
@Directive({ selector: '[vflowSelected]', host: { '[attr.data-vui-selected]': 'vflowSelected()' } })
export class VflowSelected {
  readonly vflowSelected = input(false, { transform: booleanAttribute });
}
