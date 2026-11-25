import { Directive } from '@angular/core';

/**
 * A row inside a card, such as a field, a typed port or a list item, whose own DOM box can anchor core handles.
 * Consecutive rows are separated by a hairline. No schema or endpoint state is stored here.
 */
@Directive({
  selector: '[vuiRow]',
  host: {
    class: `vui-row
      flex items-center gap-vui-2 min-h-vui-8 px-vui-3 py-vui-1
      [.vui-row+&]:border-t [.vui-row+&]:border-vui-separator`,
  },
})
export class VuiRow {}
