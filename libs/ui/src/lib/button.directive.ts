import { Directive } from '@angular/core';

/** Design-system styling for a native button; native semantics and attributes are preserved. */
@Directive({
  selector: 'button[vflowButton]',
  standalone: true,
  host: {
    class:
      'vui:rounded-md vui:bg-indigo-600 vui:px-4 vui:py-2 vui:text-sm vui:font-medium vui:text-white vui:hover:bg-indigo-700 vui:focus-visible:outline-2 vui:focus-visible:outline-offset-2 vui:focus-visible:outline-indigo-600 vui:disabled:opacity-50 vui:disabled:cursor-not-allowed',
  },
})
export class VflowButton {}
