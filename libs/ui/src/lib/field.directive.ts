import { Directive } from '@angular/core';

/** A field row whose own DOM box can anchor core handles. No schema or endpoint state is stored here. */
@Directive({
  selector: '[vflowField]',
  host: {
    class:
      'vui-field vui:flex vui:items-center vui:gap-2.5 vui:min-h-9.5 vui:px-3.5 vui:py-1.5 vui:[.vui-field+&]:border-t vui:[.vui-field+&]:border-border',
  },
})
export class VflowField {}
