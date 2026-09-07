import { Directive } from '@angular/core';

/** Design-system styling for a native button; native semantics and attributes are preserved. */
@Directive({
  selector: 'button[vflowButton]',
  standalone: true,
  host: {
    class: 'vui-button',
  },
})
export class VflowButton {}
