import { Directive } from '@angular/core';

/** Design-system styling for a native button; native semantics and attributes are preserved. */
@Directive({
  selector: 'button[vflowButton]',
  standalone: true,
  host: {
    class:
      'vui-button vui:inline-flex vui:box-border vui:justify-center vui:items-center vui:gap-1.5 vui:rounded-[7px] vui:border vui:border-transparent vui:px-3 vui:py-1.75 vui:bg-accent vui:text-on-accent vui:font-sans vui:text-[13px] vui:font-semibold vui:leading-snug vui:cursor-pointer vui:enabled:hover:brightness-110 vui:disabled:opacity-55 vui:disabled:cursor-not-allowed vui:focus-visible:outline-2 vui:focus-visible:outline-offset-3 vui:focus-visible:outline-accent vui:forced-colors:border-[ButtonText]',
  },
})
export class VflowButton {}
