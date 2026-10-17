import { Directive } from '@angular/core';

/** Design-system styling for a native button; native semantics and attributes are preserved. */
@Directive({
  selector: 'button[vuiButton]',
  standalone: true,
  host: {
    class: `vui-button
      inline-flex box-border items-center justify-center gap-vui-1 h-vui-7 px-vui-3 rounded-vui-control border border-transparent
      font-vui-sans text-vui-body font-vui-strong
      bg-vui-accent text-vui-on-accent cursor-pointer transition duration-(--vui-duration) ease-vui enabled:hover:brightness-90
      disabled:opacity-50 disabled:cursor-not-allowed
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vui-selection
      forced-colors:border-[ButtonText]`,
  },
})
export class VuiButton {}
