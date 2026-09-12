import { Directive } from '@angular/core';

/**
 * A visual frame with a title around other nodes. Parent relationships and shared movement
 * stay in graph data (ADR-0003); this directive does not create them.
 */
@Directive({
  selector: '[vflowContainer]',
  host: {
    class:
      'vui-container vui:relative vui:box-border vui:rounded-md vui:border vui:border-dashed vui:border-border vui:bg-[color-mix(in_srgb,var(--vui-surface-muted)_55%,transparent)] vui:text-foreground vui:font-sans vui:text-base vui:data-[vui-selected=true]:outline-2 vui:data-[vui-selected=true]:outline-offset-2 vui:data-[vui-selected=true]:outline-accent vui:forced-colors:data-[vui-selected=true]:outline-[Highlight]',
  },
})
export class VflowContainer {}
