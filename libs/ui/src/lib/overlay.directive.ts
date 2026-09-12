import { Directive } from '@angular/core';

/** Surface for toolbar content, for example inside core `node-toolbar`. */
@Directive({
  selector: '[vflowToolbar]',
  host: {
    class:
      'vui-toolbar vui:inline-flex vui:box-border vui:items-center vui:gap-1.5 vui:px-1.5 vui:py-1 vui:rounded-lg vui:border vui:border-border vui:bg-surface vui:text-foreground vui:font-sans vui:text-xs vui:leading-normal vui:shadow-[0_3px_10px_#0000001a]',
  },
})
export class VflowToolbar {}

/** A label placed outside a shape, below it by default; the shape element must be positioned. */
@Directive({
  selector: '[vflowExternalLabel]',
  host: {
    class:
      'vui-external-label vui:absolute vui:top-[calc(100%+8px)] vui:left-1/2 vui:-translate-x-1/2 vui:whitespace-nowrap vui:text-xs vui:leading-snug vui:text-foreground',
  },
})
export class VflowExternalLabel {}
