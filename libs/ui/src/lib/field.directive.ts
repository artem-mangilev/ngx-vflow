import { Directive } from '@angular/core';

/** A field row whose own DOM box can anchor core handles. No schema or endpoint state is stored here. */
@Directive({
  selector: '[vuiField]',
  host: {
    class: `vui-field
      flex items-center gap-vui-2 min-h-vui-8 px-vui-3 py-vui-1
      [.vui-field+&]:border-t [.vui-field+&]:border-vui-border/50`,
  },
})
export class VuiField {}
