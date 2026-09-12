import { Directive } from '@angular/core';

const SELECTED =
  'vui:data-[vui-selected=true]:outline-2 vui:data-[vui-selected=true]:outline-offset-2 vui:data-[vui-selected=true]:outline-accent vui:forced-colors:data-[vui-selected=true]:outline-[Highlight]';

/** Card shell; dimensions, content, semantics and interaction belong to the consumer and core. */
@Directive({
  selector: '[vflowNode]',
  host: {
    class: `vui-node vui:relative vui:box-border vui:rounded-md vui:border vui:border-border vui:bg-surface vui:text-foreground vui:font-sans vui:text-base vui:shadow-[0_3px_10px_#0000000a] ${SELECTED}`,
  },
})
export class VflowNode {}

@Directive({
  selector: '[vflowNodeHeader]',
  host: {
    class:
      'vui-node-header vui:flex vui:items-center vui:gap-2.5 vui:p-3.5 vui:font-semibold vui:rounded-t-md vui:border-b vui:border-border vui:bg-surface-muted',
  },
})
export class VflowNodeHeader {}

@Directive({ selector: '[vflowNodeBody]', host: { class: 'vui-node-body vui:p-3.5' } })
export class VflowNodeBody {}

@Directive({
  selector: '[vflowNodeFooter]',
  host: {
    class:
      'vui-node-footer vui:flex vui:flex-wrap vui:items-center vui:gap-2.5 vui:p-3.5 vui:border-t vui:border-border',
  },
})
export class VflowNodeFooter {}
